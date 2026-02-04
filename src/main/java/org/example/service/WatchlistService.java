package org.example.service;

import org.example.client.*;
import org.example.dto.MarketQuote;
import org.example.model.AssetType;
import org.example.model.WatchlistAsset;
import org.example.repository.WatchlistRepository;
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
        return repo.findBySymbol(symbol)
                .orElseGet(() -> repo.save(new WatchlistAsset(symbol, type)));
    }

    @Transactional
    public void remove(String symbol) {
        repo.deleteBySymbol(symbol);
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
}
