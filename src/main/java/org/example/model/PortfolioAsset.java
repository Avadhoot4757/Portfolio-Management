package org.example.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_assets")
public class PortfolioAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String symbol;   // TCS.NS, BTC, GOVT10Y etc.

    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    @Column(precision = 19, scale = 6)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 6)
    private BigDecimal buyPrice;

    private LocalDateTime buyTime;

    public PortfolioAsset() {}

    public PortfolioAsset(Long id, String symbol, AssetType assetType,
                          BigDecimal quantity, BigDecimal buyPrice, LocalDateTime buyTime) {
        this.id = id;
        this.symbol = symbol;
        this.assetType = assetType;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.buyTime = buyTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public AssetType getAssetType() { return assetType; }
    public void setAssetType(AssetType assetType) { this.assetType = assetType; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getBuyPrice() { return buyPrice; }
    public void setBuyPrice(BigDecimal buyPrice) { this.buyPrice = buyPrice; }

    public LocalDateTime getBuyTime() { return buyTime; }
    public void setBuyTime(LocalDateTime buyTime) { this.buyTime = buyTime; }
}
