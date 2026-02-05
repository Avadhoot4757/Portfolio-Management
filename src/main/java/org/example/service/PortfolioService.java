package org.example.service;

import org.example.client.StockClient;
import org.example.client.BondClient;
import org.example.client.CryptoClient;
import org.example.model.AssetPerformance;
import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.example.model.PortfolioPerformance;
import org.example.repository.PortfolioRepository;
import org.example.exceptions.ResourceNotFoundException; // Fix 1: Corrected import
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PortfolioService {

    private final PortfolioRepository repository;
    private final StockClient stockClient;
    private final BondClient bondClient;
    private final CryptoClient cryptoClient;
    private final WatchlistService watchlistService;

    public PortfolioService(PortfolioRepository repository,
                            StockClient stockClient,
                            BondClient bondClient,
                            CryptoClient cryptoClient,
                            WatchlistService watchlistService) {
        this.repository = repository;
        this.stockClient = stockClient;
        this.bondClient = bondClient;
        this.cryptoClient = cryptoClient;
        this.watchlistService = watchlistService;
    }

    private BigDecimal getLivePrice(String symbol, AssetType type) {
        return switch (type) {
            case STOCK -> BigDecimal.valueOf(stockClient.getStockQuote(symbol).getPrice());
            case BOND -> BigDecimal.valueOf(bondClient.getBondQuote(symbol).getPrice());
            case CRYPTO -> BigDecimal.valueOf(cryptoClient.getCryptoQuote(symbol).getPrice());
        };
    }

    public PortfolioAsset addAssetWithHistoricalPrice(String symbol, AssetType type,
                                                      BigDecimal quantity, LocalDateTime buyTime) {
        // 1. CHANGE THIS LINE: Call your new Python bridge instead of the old API method
        BigDecimal historicalPrice = fetchPriceWithPython(symbol, buyTime);
        System.out.println(historicalPrice);

        // 2. The rest of the logic remains exactly the same
        PortfolioAsset asset = new PortfolioAsset();
        asset.setSymbol(symbol);
        asset.setAssetType(type);
        asset.setQuantity(quantity);
        asset.setBuyPrice(historicalPrice); // Now this holds the Python-fetched price!
        asset.setBuyTime(buyTime);

        PortfolioAsset saved = repository.save(asset);
        watchlistService.add(symbol, type);
        return saved;
    }


    public BigDecimal fetchPriceWithPython(String symbol, LocalDateTime buyTime) {
        try {
            String formattedSymbol = symbol;
            String dateStr = buyTime.toLocalDate().toString(); // YYYY-MM-DD
            Path scriptPath = Paths.get(System.getProperty("user.dir"), "fetch_price.py").toAbsolutePath();

            System.out.println("[PyBridge] running: python3 " + scriptPath + " " + formattedSymbol + " " + dateStr);
            ProcessBuilder pb = new ProcessBuilder("python3", scriptPath.toString(), formattedSymbol, dateStr);
            pb.directory(new File(System.getProperty("user.dir")));
            pb.redirectErrorStream(true);

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            ArrayList<String> lines = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isBlank()) {
                    String trimmed = line.trim();
                    lines.add(trimmed);
                    System.out.println("[PyBridge] OUT: " + trimmed);
                }
            }
            int exitCode = process.waitFor();
            System.out.println("[PyBridge] exit code: " + exitCode);

            // If the Python script failed (non-zero), don't attempt to extract a number from arbitrary debug text:
            if (exitCode != 0) {
                System.out.println("[PyBridge] python returned non-zero exit code; treating as failure");
                return BigDecimal.ZERO;
            }

            // Prefer explicit PRICE: line from Python
            for (String l : lines) {
                if (l.startsWith("PRICE:")) {
                    String val = l.substring("PRICE:".length()).trim();
                    try {
                        BigDecimal res = new BigDecimal(val);
                        System.out.println("[PyBridge] parsed PRICE: " + res);
                        if (res.compareTo(BigDecimal.ZERO) != 0) {
                            return res;
                        }
                    } catch (Exception e) {
                        System.out.println("[PyBridge] failed to parse PRICE line: " + val);
                    }
                }
            }

            // Fallback: first numeric found in combined output (only reached if exitCode == 0)
            if (!lines.isEmpty()) {
                String combined = String.join(" ", lines);
                Pattern pattern = Pattern.compile("[-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?");
                Matcher matcher = pattern.matcher(combined);
                if (matcher.find()) {
                    String numeric = matcher.group();
                    System.out.println("[PyBridge] regex found numeric: " + numeric);
                    if (!numeric.equals("0")) {
                        return new BigDecimal(numeric);
                    } else {
                        System.out.println("[PyBridge] numeric is zero, returning fallback");
                    }
                } else {
                    System.out.println("[PyBridge] no numeric found in output");
                }
            }
        } catch (Exception e) {
            System.out.println("[PyBridge] exception: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("[PyBridge] returning BigDecimal.ZERO as fallback");
        return BigDecimal.ZERO; // Fallback if Python fails
    }

    public void removeAsset(Long id) {
        // Instead of finding by symbol and subtracting, we find the specific ID
        PortfolioAsset asset = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with ID " + id + " not found"));

        // We remove the entire entry from the database
        repository.delete(asset);
    }

    public List<PortfolioAsset> getAllAssets() {
        return repository.findAll();
    }

    public PortfolioPerformance getPerformance() {
        List<PortfolioAsset> assets = repository.findAll();

        List<AssetPerformance> assetStats = assets.stream().map(asset -> {
            BigDecimal currentPrice = getLivePrice(asset.getSymbol(), asset.getAssetType());
            BigDecimal invested = asset.getBuyPrice().multiply(asset.getQuantity());
            BigDecimal currentValue = currentPrice.multiply(asset.getQuantity());
            BigDecimal pnl = currentValue.subtract(invested);

            BigDecimal pnlPercent = BigDecimal.ZERO;
            if (invested.compareTo(BigDecimal.ZERO) > 0) {
                pnlPercent = pnl.divide(invested, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            return new AssetPerformance(
                    asset.getSymbol(),
                    asset.getAssetType(),
                    asset.getQuantity(),
                    asset.getBuyPrice(),
                    asset.getBuyTime(),
                    currentPrice,
                    invested,
                    currentValue,
                    pnl,
                    pnlPercent
            );
        }).toList();

        BigDecimal totalInvested = assetStats.stream()
                .map(AssetPerformance::getInvested)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCurrent = assetStats.stream()
                .map(AssetPerformance::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPnL = totalCurrent.subtract(totalInvested);
        BigDecimal totalPercent = BigDecimal.ZERO;

        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalPercent = totalPnL.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Fix 2: Updated to return the Performance DTO instead of looking for an ID
        return new PortfolioPerformance(assetStats, totalInvested, totalCurrent, totalPnL, totalPercent);
    }
    public PortfolioPerformance getPerformanceById(Long id) {
        // This line throws your custom exception if the ID is missing
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio with ID " + id + " not found"));

        // If it is found, return the performance (reuse your existing logic)
        return getPerformance();
    }

}
