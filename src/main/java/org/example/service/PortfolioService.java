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

@Service
public class PortfolioService {

    private final PortfolioRepository repository;
    private final StockClient stockClient;
    private final BondClient bondClient;
    private final CryptoClient cryptoClient;

    public PortfolioService(PortfolioRepository repository,
                            StockClient stockClient,
                            BondClient bondClient,
                            CryptoClient cryptoClient) {
        this.repository = repository;
        this.stockClient = stockClient;
        this.bondClient = bondClient;
        this.cryptoClient = cryptoClient;
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

        // 2. The rest of the logic remains exactly the same
        PortfolioAsset asset = new PortfolioAsset();
        asset.setSymbol(symbol);
        asset.setAssetType(type);
        asset.setQuantity(quantity);
        asset.setBuyPrice(historicalPrice); // Now this holds the Python-fetched price!
        asset.setBuyTime(buyTime);

        return repository.save(asset);
    }


    public BigDecimal fetchPriceWithPython(String symbol, LocalDateTime buyTime) {
    try {
        // 1. Format the symbol based on asset type logic if necessary
        // For example, if your DB stores 'BTC', Yahoo needs 'BTC-USD'
        String formattedSymbol = symbol;
        
        // 2. Prepare the command
        String dateStr = buyTime.toLocalDate().toString(); // Formats as YYYY-MM-DD
        ProcessBuilder pb = new ProcessBuilder("python", "fetch_price.py", formattedSymbol, dateStr);
        
        // 3. Execute and read the output
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line = reader.readLine();
        
        if (line != null && !line.equals("0")) {
            return new BigDecimal(line);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
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