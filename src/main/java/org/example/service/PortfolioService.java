package org.example.service;

import org.example.client.StockClient;
import org.example.client.BondClient;
import org.example.client.CryptoClient;
import org.example.dto.ChartDataDTO;
import org.example.dto.PortfolioHistoryPointDTO;
import org.example.model.AssetPerformance;
import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.example.model.PortfolioPerformance;
import org.example.repository.PortfolioRepository;
import org.example.exceptions.ResourceNotFoundException; // Fix 1: Corrected import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Map;
import java.util.HashMap;
import java.util.Comparator;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Service
public class PortfolioService {

    private final PortfolioRepository repository;
    private final StockClient stockClient;
    private final BondClient bondClient;
    private final CryptoClient cryptoClient;
    private final WatchlistService watchlistService;

    @Value("${yahoo.api.key}")
    private String apiKey;

    @Value("${yahoo.api.host}")
    private String apiHost;

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

    private BigDecimal getLivePrice(String symbol, AssetType type, BigDecimal fallbackPrice) {
        try {
            String formattedSymbol = formatSymbol(symbol, type);
            return switch (type) {
                case STOCK -> BigDecimal.valueOf(stockClient.getStockQuote(formattedSymbol).getPrice());
                case BOND -> BigDecimal.valueOf(bondClient.getBondQuote(formattedSymbol).getPrice());
                case CRYPTO -> BigDecimal.valueOf(cryptoClient.getCryptoQuote(formattedSymbol).getPrice());
            };
        } catch (Exception e) {
            return fallbackPrice != null ? fallbackPrice : BigDecimal.ZERO;
        }
    }

    public PortfolioAsset addAssetWithHistoricalPrice(String symbol, AssetType type,
                                                      BigDecimal quantity, LocalDateTime buyTime) {
        if (buyTime == null) {
            throw new IllegalArgumentException("buyTime is required");
        }
        LocalDateTime normalizedBuyTime = buyTime.toLocalDate().atStartOfDay();

        PortfolioAsset existing = repository.findBySymbolAndBuyTime(symbol, normalizedBuyTime)
                .orElse(null);

        if (existing != null) {
            BigDecimal existingQty = existing.getQuantity() == null ? BigDecimal.ZERO : existing.getQuantity();
            BigDecimal updatedQty = existingQty.add(quantity);
            existing.setQuantity(updatedQty);

            if (existing.getBuyPrice() == null || existing.getBuyPrice().compareTo(BigDecimal.ZERO) == 0) {
                BigDecimal historicalPrice = fetchPriceWithPython(symbol, type, normalizedBuyTime);
                existing.setBuyPrice(historicalPrice);
            }

            PortfolioAsset saved = repository.save(existing);
            watchlistService.add(symbol, type);
            return saved;
        }

        BigDecimal historicalPrice = fetchPriceWithPython(symbol, type, normalizedBuyTime);
        System.out.println(historicalPrice);

        PortfolioAsset asset = new PortfolioAsset();
        asset.setSymbol(symbol);
        asset.setAssetType(type);
        asset.setQuantity(quantity);
        asset.setBuyPrice(historicalPrice);
        asset.setBuyTime(normalizedBuyTime);

        PortfolioAsset saved = repository.save(asset);
        watchlistService.add(symbol, type);
        return saved;
    }


    public BigDecimal fetchPriceWithPython(String symbol, AssetType type, LocalDateTime buyTime) {
        try {
            String formattedSymbol = formatSymbol(symbol, type);
            String dateStr = buyTime.toLocalDate().toString(); // YYYY-MM-DD
            Path scriptPath = Paths.get(System.getProperty("user.dir"), "fetch_price.py").toAbsolutePath();

            System.out.println("[PyBridge] running: python " + scriptPath + " " + formattedSymbol + " " + dateStr);
            ProcessBuilder pb = new ProcessBuilder("python", scriptPath.toString(), formattedSymbol, dateStr);
            pb.directory(new File(System.getProperty("user.dir")));
            pb.redirectErrorStream(true);
            pb.environment().put("RAPIDAPI_KEY", apiKey == null ? "" : apiKey.trim());
            pb.environment().put("RAPIDAPI_HOST", apiHost == null ? "" : apiHost.trim());

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

    public void removeAsset(Long id, BigDecimal quantityToRemove) {
        // Instead of finding by symbol and subtracting, we find the specific ID
        PortfolioAsset asset = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with ID " + id + " not found"));

        if (quantityToRemove == null || quantityToRemove.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity to remove must be positive");
        }

        BigDecimal currentQty = asset.getQuantity() == null ? BigDecimal.ZERO : asset.getQuantity();
        if (quantityToRemove.compareTo(currentQty) >= 0) {
            repository.delete(asset);
            return;
        }

        asset.setQuantity(currentQty.subtract(quantityToRemove));
        repository.save(asset);
    }

    public List<PortfolioAsset> getAllAssets() {
        return repository.findAll();
    }

    public List<PortfolioAsset> backfillMissingBuyPrices() {
        List<PortfolioAsset> assets = repository.findAll();
        List<PortfolioAsset> updated = new ArrayList<>();

        for (PortfolioAsset asset : assets) {
            if (asset.getBuyTime() == null || asset.getQuantity() == null) {
                continue;
            }
            BigDecimal buyPrice = asset.getBuyPrice();
            if (buyPrice != null && buyPrice.compareTo(BigDecimal.ZERO) != 0) {
                continue;
            }

            BigDecimal fetched = fetchPriceWithPython(
                    asset.getSymbol(),
                    asset.getAssetType(),
                    asset.getBuyTime()
            );
            System.out.println("[Backfill] symbol=" + asset.getSymbol()
                    + " buyTime=" + asset.getBuyTime()
                    + " fetched=" + fetched);
            if (fetched.compareTo(BigDecimal.ZERO) != 0) {
                asset.setBuyPrice(fetched);
                updated.add(asset);
            }
        }

        if (!updated.isEmpty()) {
            repository.saveAll(updated);
        }

        return updated;
    }

    public List<ChartDataDTO> getPerformanceHistory(String symbol) {
        try {
            String formattedSymbol = formatSymbol(symbol, null);
            Path scriptPath = Paths.get(System.getProperty("user.dir"), "fetch_price.py").toAbsolutePath();
            ProcessBuilder pb = new ProcessBuilder("python", scriptPath.toString(), formattedSymbol);
            pb.redirectErrorStream(true);
            pb.environment().put("RAPIDAPI_KEY", apiKey == null ? "" : apiKey.trim());
            pb.environment().put("RAPIDAPI_HOST", apiHost == null ? "" : apiHost.trim());

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }
            process.waitFor(15, TimeUnit.SECONDS);

            String raw = output.toString().trim();
            if (raw.isEmpty() || raw.equals("0")) {
                return List.of();
            }

            int startIdx = raw.indexOf('[');
            int endIdx = raw.lastIndexOf(']');
            if (startIdx == -1 || endIdx == -1 || endIdx < startIdx) {
                return List.of();
            }
            String json = raw.substring(startIdx, endIdx + 1);

            ChartDataDTO[] data = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(json, ChartDataDTO[].class);
            return Arrays.asList(data);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public List<PortfolioHistoryPointDTO> getPortfolioHistory() {
        List<PortfolioAsset> assets = repository.findAll();
        if (assets.isEmpty()) {
            return List.of();
        }

        Map<String, List<ChartDataDTO>> histories = new HashMap<>();
        for (PortfolioAsset asset : assets) {
            if (asset.getAssetType() == AssetType.CRYPTO) {
                continue;
            }
            String formattedSymbol = formatSymbol(asset.getSymbol(), asset.getAssetType());
            if (formattedSymbol == null || formattedSymbol.isBlank() || histories.containsKey(formattedSymbol)) {
                continue;
            }
            histories.put(formattedSymbol, getPerformanceHistory(formattedSymbol));
        }

        List<ChartDataDTO> baseHistory = histories.values().stream()
                .filter(list -> list != null && !list.isEmpty())
                .findFirst()
                .orElse(List.of());

        if (baseHistory.isEmpty()) {
            return List.of();
        }

        List<String> dates = baseHistory.stream()
                .sorted(Comparator.comparing(ChartDataDTO::getDate))
                .map(ChartDataDTO::getDate)
                .toList();

        Map<String, Map<String, BigDecimal>> priceBySymbolDate = new HashMap<>();
        for (Map.Entry<String, List<ChartDataDTO>> entry : histories.entrySet()) {
            Map<String, BigDecimal> byDate = new HashMap<>();
            for (ChartDataDTO point : entry.getValue()) {
                if (point.getDate() != null && point.getValue() != null) {
                    byDate.put(point.getDate(), point.getValue());
                }
            }
            priceBySymbolDate.put(entry.getKey(), byDate);
        }

        Map<String, BigDecimal> lastPrices = new HashMap<>();
        List<PortfolioHistoryPointDTO> result = new ArrayList<>();
        for (String dateStr : dates) {
            LocalDate date = LocalDate.parse(dateStr);
            BigDecimal totalValue = BigDecimal.ZERO;
            BigDecimal totalInvested = BigDecimal.ZERO;

            for (PortfolioAsset asset : assets) {
                if (asset.getAssetType() == AssetType.CRYPTO) {
                    continue;
                }
                if (asset.getBuyTime() == null || asset.getBuyPrice() == null || asset.getQuantity() == null) {
                    continue;
                }
                if (asset.getBuyTime().toLocalDate().isAfter(date)) {
                    continue;
                }

                BigDecimal invested = asset.getBuyPrice().multiply(asset.getQuantity());
                totalInvested = totalInvested.add(invested);

                String formattedSymbol = formatSymbol(asset.getSymbol(), asset.getAssetType());
                Map<String, BigDecimal> priceMap = priceBySymbolDate.get(formattedSymbol);
                if (priceMap == null || priceMap.isEmpty()) {
                    continue;
                }

                BigDecimal price = priceMap.get(dateStr);
                if (price != null) {
                    lastPrices.put(formattedSymbol, price);
                }
                BigDecimal effectivePrice = lastPrices.get(formattedSymbol);
                if (effectivePrice != null) {
                    totalValue = totalValue.add(effectivePrice.multiply(asset.getQuantity()));
                }
            }

            result.add(new PortfolioHistoryPointDTO(dateStr, totalValue, totalInvested));
        }

        return result;
    }

    private String formatSymbol(String symbol, AssetType type) {
        if (symbol == null) {
            return null;
        }
        String trimmed = symbol.trim();
        if (trimmed.isEmpty()) {
            return trimmed;
        }
        if (trimmed.contains("-") || trimmed.contains(".") || trimmed.startsWith("^")) {
            return trimmed;
        }
        if (type == AssetType.CRYPTO) {
            return trimmed + "-USD";
        }
        switch (trimmed.toUpperCase()) {
            case "BTC":
            case "ETH":
            case "SOL":
            case "ADA":
            case "XRP":
            case "DOGE":
            case "BNB":
            case "AVAX":
            case "DOT":
            case "LTC":
            case "BCH":
            case "LINK":
            case "MATIC":
            case "ATOM":
            case "XLM":
            case "TRX":
            case "ETC":
                return trimmed.toUpperCase() + "-USD";
            default:
                return trimmed;
        }
    }

    public PortfolioPerformance getPerformance() {
        List<PortfolioAsset> assets = repository.findAll();

        List<AssetPerformance> assetStats = assets.stream().map(asset -> {
            BigDecimal currentPrice = getLivePrice(
                    asset.getSymbol(),
                    asset.getAssetType(),
                    asset.getBuyPrice()
            );
            BigDecimal invested = asset.getBuyPrice().multiply(asset.getQuantity());
            BigDecimal currentValue = currentPrice.multiply(asset.getQuantity());
            BigDecimal pnl = currentValue.subtract(invested);

            BigDecimal pnlPercent = BigDecimal.ZERO;
            if (invested.compareTo(BigDecimal.ZERO) > 0) {
                pnlPercent = pnl.divide(invested, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            return new AssetPerformance(
                    asset.getId(),
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
