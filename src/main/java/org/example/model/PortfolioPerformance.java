package org.example.model;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioPerformance {

    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal profitLossPercent;
    private List<AssetPerformance> assets;

    public PortfolioPerformance(List<AssetPerformance> assets,
                                BigDecimal totalInvested,
                                BigDecimal currentValue,
                                BigDecimal profitLoss,
                                BigDecimal profitLossPercent) {
        this.assets = assets; // List now comes first
        this.totalInvested = totalInvested;
        this.currentValue = currentValue;
        this.profitLoss = profitLoss;
        this.profitLossPercent = profitLossPercent;
    }

    public BigDecimal getTotalInvested() { return totalInvested; }
    public BigDecimal getCurrentValue() { return currentValue; }
    public BigDecimal getProfitLoss() { return profitLoss; }
    public BigDecimal getProfitLossPercent() { return profitLossPercent; }
    public List<AssetPerformance> getAssets() { return assets; }
}

