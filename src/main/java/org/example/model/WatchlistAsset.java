package org.example.model;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist_assets")
public class WatchlistAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String symbol;

    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    public WatchlistAsset() {}

    public WatchlistAsset(String symbol, AssetType assetType) {
        this.symbol = symbol;
        this.assetType = assetType;
    }

    public Long getId() { return id; }
    public String getSymbol() { return symbol; }
    public AssetType getAssetType() { return assetType; }

    public void setSymbol(String symbol) { this.symbol = symbol; }
    public void setAssetType(AssetType assetType) { this.assetType = assetType; }
}
