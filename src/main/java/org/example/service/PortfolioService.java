package org.example.service;

import org.example.client.MarketClient;
import org.example.model.PortfolioAsset;
import org.example.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioRepository repository;
    private final MarketClient marketClient;

    public PortfolioService(PortfolioRepository repository, MarketClient marketClient) {
        this.repository = repository;
        this.marketClient = marketClient;
    }

    public PortfolioAsset buyAsset(String ticker, double quantity) {
        double livePrice = marketClient.getLivePrice(ticker);

        PortfolioAsset asset = repository.findByTicker(ticker).orElse(null);

        if (asset == null) {
            asset = new PortfolioAsset();
            asset.setTicker(ticker);
            asset.setQuantity(0);
            asset.setBuyPrice(livePrice);
        }

        asset.setQuantity(asset.getQuantity() + quantity);
        asset.setBuyTime(LocalDateTime.now());

        return repository.save(asset);
    }

    public PortfolioAsset sellAsset(String ticker, double quantity) {
        PortfolioAsset asset = repository.findByTicker(ticker)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        asset.setQuantity(asset.getQuantity() - quantity);
        return repository.save(asset);
    }

    public List<PortfolioAsset> getAllAssets() {
        return repository.findAll();
    }

    public double getTotalPortfolioValue() {
        return repository.findAll().stream()
                .mapToDouble(a -> a.getQuantity() * marketClient.getLivePrice(a.getTicker()))
                .sum();
    }
}

