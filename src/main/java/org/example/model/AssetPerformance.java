package org.example.model;

import java.math.BigDecimal;

public class AssetPerformance {

    private String symbol;
    private AssetType type;
    private BigDecimal quantity;
    private BigDecimal buyPrice;
    private BigDecimal currentPrice;
    private BigDecimal invested;
    private BigDecimal currentValue;
    private BigDecimal pnl;
    private BigDecimal pnlPercent;

    public AssetPerformance(String symbol, AssetType type, BigDecimal quantity,
                            BigDecimal buyPrice, BigDecimal currentPrice,
                            BigDecimal invested, BigDecimal currentValue,
                            BigDecimal pnl, BigDecimal pnlPercent) {
        this.symbol = symbol;
        this.type = type;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
        this.currentPrice = currentPrice;
        this.invested = invested;
        this.currentValue = currentValue;
        this.pnl = pnl;
        this.pnlPercent = pnlPercent;
    }

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

