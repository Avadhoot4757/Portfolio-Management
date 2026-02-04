package org.example.service;

import org.example.client.StockClient;
import org.example.client.BondClient;
import org.example.client.CryptoClient;
import org.example.model.AssetPerformance;
import org.example.model.AssetType;
import org.example.model.PortfolioAsset;
import org.example.model.PortfolioPerformance;
import org.example.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

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

    public PortfolioAsset buyAsset(String symbol, AssetType type, BigDecimal quantity) {

        BigDecimal livePrice = getLivePrice(symbol, type);

        PortfolioAsset asset = repository.findBySymbol(symbol).orElse(null);

        if (asset == null) {
            asset = new PortfolioAsset();
            asset.setSymbol(symbol);
            asset.setAssetType(type);
            asset.setQuantity(BigDecimal.ZERO);
            asset.setBuyPrice(livePrice);
        }

        asset.setQuantity(asset.getQuantity().add(quantity));
        asset.setBuyTime(LocalDateTime.now());

        return repository.save(asset);
    }

    public PortfolioAsset sellAsset(String symbol, BigDecimal quantity) {

        PortfolioAsset asset = repository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        asset.setQuantity(asset.getQuantity().subtract(quantity));

        if (asset.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            repository.delete(asset);
            return asset;
        }

        return repository.save(asset);
    }

    public List<PortfolioAsset> getAllAssets() {
        return repository.findAll();
    }

    public BigDecimal getTotalPortfolioValue() {
        return repository.findAll().stream()
                .map(asset -> asset.getQuantity()
                        .multiply(getLivePrice(asset.getSymbol(), asset.getAssetType())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

        // 🔥 Portfolio Totals
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

        return new PortfolioPerformance(totalInvested, totalCurrent, totalPnL, totalPercent, assetStats);
    }
}
