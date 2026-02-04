import React, { useMemo, useState } from "react";
import AnimatedCard from "./AnimatedCard";
import PerformanceChart from "./PerformanceChart";
import HoldingsTable from "./HoldingsTable";
import SummaryCards from "./SummaryCards";

const resolveAssetHistory = (asset) => {
  const history =
    asset?.history ||
    asset?.performanceHistory ||
    asset?.priceHistory ||
    [];
  if (Array.isArray(history) && history.length > 0) return history;

  const invested = Number(asset?.invested || 0);
  const quantity = Number(asset?.quantity || 0);
  const buyPrice = Number(asset?.buyPrice || 0);
  const currentValue = Number(asset?.currentValue || 0);
  const currentPrice = Number(asset?.currentPrice || 0);

  const fallbackInvested = invested || buyPrice * quantity;
  const fallbackCurrentValue = currentValue || currentPrice * quantity;

  if (!fallbackInvested && !fallbackCurrentValue) return [];

  return [
    { date: "Buy", value: fallbackInvested },
    { date: "Now", value: fallbackCurrentValue }
  ];
};

const PerformancePage = ({
  history,
  performance,
  totalValue,
  formatCurrency,
  formatPercent
}) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const assets = performance.assets || [];
  const summaryCards = useMemo(() => {
    const totalInvested = Number(performance.totalInvested || 0);
    const currentValue = Number(performance.currentValue || totalValue || 0);
    const profitLoss = Number(performance.profitLoss || currentValue - totalInvested || 0);
    const profitLossPercent = Number(
      performance.profitLossPercent ||
        (totalInvested ? (profitLoss / totalInvested) * 100 : 0)
    );

    return [
      { label: "Total Invested", value: formatCurrency(totalInvested) },
      { label: "Current Value", value: formatCurrency(currentValue) },
      { label: "Total P/L", value: formatCurrency(profitLoss) },
      { label: "P/L Percent", value: formatPercent(profitLossPercent) }
    ];
  }, [performance, totalValue, formatCurrency, formatPercent]);

  const chartTitle = selectedAsset
    ? `${selectedAsset.symbol} Performance`
    : "Portfolio Performance";
  const chartHistory = selectedAsset
    ? resolveAssetHistory(selectedAsset)
    : history;

  return (
    <section id="performance" className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Performance</h2>
          <p className="section-subtitle">
            Track portfolio momentum and long-term returns.
          </p>
        </div>
        <div className="section-meta">
          <span className="meta-label">Portfolio value</span>
          <span className="meta-value">{formatCurrency(totalValue)}</span>
        </div>
      </div>

      <AnimatedCard className="card-lg" delay={0.1}>
        <div className="card-header">
          <h3>{chartTitle}</h3>
          <button
            className="card-action"
            type="button"
            onClick={() => setSelectedAsset(null)}
            disabled={!selectedAsset}
          >
            Show Portfolio
          </button>
        </div>
        {chartHistory && chartHistory.length > 0 ? (
          <PerformanceChart history={chartHistory} />
        ) : (
          <div className="chart-empty">
            No history available for this asset yet.
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="table-card" delay={0.15}>
        <div className="card-header">
          <h3>Individual Asset Performance</h3>
        </div>
        <HoldingsTable
          rows={assets}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          selectedSymbol={selectedAsset?.symbol}
          onRowClick={(row) => setSelectedAsset(row)}
        />
      </AnimatedCard>

      <SummaryCards cards={summaryCards} />
    </section>
  );
};

export default PerformancePage;
