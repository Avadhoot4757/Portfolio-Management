package org.example.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AssetPerformance {

    private Long id;
    private String symbol;
    private AssetType type;
    private BigDecimal quantity;
    private BigDecimal buyPrice;
    private LocalDateTime buyTime;
    private BigDecimal currentPrice;
    private BigDecimal invested;
    private BigDecimal currentValue;
    private BigDecimal pnl;
    private BigDecimal pnlPercent;

    public AssetPerformance(Long id, String symbol, AssetType type, BigDecimal quantity,
                            BigDecimal buyPrice, LocalDateTime buyTime, BigDecimal currentPrice,
                            BigDecimal invested, BigDecimal currentValue,
                            BigDecimal pnl, BigDecimal pnlPercent) {
        this.id = id;
        this.symbol = symbol;
        this.type = type;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.buyTime = buyTime;
        this.currentPrice = currentPrice;
        this.invested = invested;
        this.currentValue = currentValue;
        this.pnl = pnl;
        this.pnlPercent = pnlPercent;
    }
    public LocalDateTime getBuyTime() { return buyTime; }
    public Long getId() { return id; }
    public String getSymbol() { return symbol; }
    public AssetType getType() { return type; }
    public BigDecimal getQuantity() { return quantity; }
    public BigDecimal getBuyPrice() { return buyPrice; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public BigDecimal getInvested() { return invested; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public BigDecimal getPnl() { return pnl; }
    public BigDecimal getPnlPercent() { return pnlPercent; }
}
