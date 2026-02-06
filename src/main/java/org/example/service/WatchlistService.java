package org.example.service;

import org.example.client.*;
import org.example.dto.MarketQuote;
import org.example.model.AssetType;
import org.example.model.WatchlistAsset;
import org.example.repository.WatchlistRepository;
import org.example.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository repo;
    private final StockClient stockClient;
    private final BondClient bondClient;
    private final CryptoClient cryptoClient;

    public WatchlistService(WatchlistRepository repo,
                            StockClient stockClient,
                            BondClient bondClient,
                            CryptoClient cryptoClient) {
        this.repo = repo;
        this.stockClient = stockClient;
        this.bondClient = bondClient;
        this.cryptoClient = cryptoClient;
    }

    @Transactional
    public WatchlistAsset add(String symbol, AssetType type) {
        String normalized = symbol == null ? null : symbol.toUpperCase();
        return repo.findBySymbolIgnoreCase(normalized)
                .map(existing -> {
                    if (existing.getAssetType() == null && type != null) {
                        existing.setAssetType(type);
                        return repo.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> repo.save(new WatchlistAsset(normalized, type)));
    }

    @Transactional
    public void remove(String symbol) {
        repo.deleteBySymbolIgnoreCase(symbol);
    }

    public List<WatchlistAsset> getAll() {
        return repo.findAll();
    }

    public List<MarketQuote> getLiveWatchlist() {
        return repo.findAll().stream().map(asset -> switch (asset.getAssetType()) {
            case STOCK -> stockClient.getStockQuote(asset.getSymbol());
            case BOND -> bondClient.getBondQuote(asset.getSymbol());
            case CRYPTO -> cryptoClient.getCryptoQuote(asset.getSymbol());
        }).toList();
    }

    public MarketQuote getQuoteForSymbol(String symbol) {
        WatchlistAsset asset = repo.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist asset " + symbol + " not found"));

        return switch (asset.getAssetType()) {
            case STOCK -> stockClient.getStockQuote(asset.getSymbol());
            case BOND -> bondClient.getBondQuote(asset.getSymbol());
            case CRYPTO -> cryptoClient.getCryptoQuote(asset.getSymbol());
        };
    }
}
