import React, { useMemo, useState } from "react";
import AnimatedCard from "./AnimatedCard";
import AssetAllocationChart from "./AssetAllocationChart";
import PerformanceChart from "./PerformanceChart";
import HoldingsTable from "./HoldingsTable";
import SummaryCards from "./SummaryCards";

const Dashboard = ({
  allocation,
  assets,
  history,
  summaryCards,
  totalValue,
  cashBalance,
  onAddCash,
  onRemoveCash,
  formatCurrency,
  formatPercent
}) => {
  const [cashAmount, setCashAmount] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("PORTFOLIO");

  const parsedCashAmount = Number(cashAmount);
  const isValidAmount = !Number.isNaN(parsedCashAmount) && parsedCashAmount > 0;

  const handleAddCash = () => {
    if (!isValidAmount) return;
    onAddCash?.(parsedCashAmount);
    setCashAmount("");
  };

  const handleRemoveCash = () => {
    if (!isValidAmount) return;
    onRemoveCash?.(parsedCashAmount);
    setCashAmount("");
  };

  const holdingSymbols = useMemo(() => {
    const symbols = assets
      .map((asset) => String(asset.symbol || "").toUpperCase())
      .filter(Boolean);
    return Array.from(new Set(symbols));
  }, [assets]);

  const normalizedSelected =
    selectedSymbol === "PORTFOLIO"
      ? "PORTFOLIO"
      : String(selectedSymbol || "").toUpperCase();

  const isPortfolioView = normalizedSelected === "PORTFOLIO";

  const selectedLots = useMemo(() => {
    if (isPortfolioView) return [];
    return assets.filter(
      (asset) =>
        String(asset.symbol || "").toUpperCase() === normalizedSelected
    );
  }, [assets, isPortfolioView, normalizedSelected]);

  const portfolioHistory = useMemo(() => {
    const dateTimes = assets
      .map((asset) => asset.buyTime)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dateTimes.length === 0) {
      const currentTotal = assets.reduce((sum, asset) => {
        const currentPrice = Number(asset.currentPrice || 0);
        const currentValue =
          Number(asset.currentValue || 0) ||
          currentPrice * Number(asset.quantity || 0);
        return sum + currentValue;
      }, 0) + Number(cashBalance || 0);
      if (currentTotal <= 0) return [];
      return [
        {
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          value: currentTotal
        }
      ];
    }

    const uniqueTimes = Array.from(
      new Map(dateTimes.map((date) => [date.toISOString(), date])).values()
    );

    const historyPoints = uniqueTimes.map((date) => {
      const totalAtDate = assets.reduce((sum, asset) => {
        const buyTime = asset.buyTime ? new Date(asset.buyTime) : null;
        if (!buyTime || Number.isNaN(buyTime.getTime())) return sum;
        if (buyTime.getTime() > date.getTime()) return sum;
        return sum + Number(asset.buyPrice || 0) * Number(asset.quantity || 0);
      }, 0) + Number(cashBalance || 0);

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }),
        value: totalAtDate
      };
    });

    const currentTotal = assets.reduce((sum, asset) => {
      const currentPrice = Number(asset.currentPrice || 0);
      const currentValue =
        Number(asset.currentValue || 0) ||
        currentPrice * Number(asset.quantity || 0);
      return sum + currentValue;
    }, 0) + Number(cashBalance || 0);

    historyPoints.push({
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      value: currentTotal
    });

    return historyPoints;
  }, [assets, cashBalance]);

  const stockChartsUrl = useMemo(() => {
    if (isPortfolioView || selectedLots.length === 0) return "";
    const symbol = normalizedSelected;
    const earliestLot = selectedLots.reduce((earliest, lot) => {
      if (!lot.buyTime) return earliest;
      const lotTime = new Date(lot.buyTime);
      if (Number.isNaN(lotTime.getTime())) return earliest;
      if (!earliest) return lotTime;
      return lotTime < earliest ? lotTime : earliest;
    }, null);

    const startDate = earliestLot
      ? earliestLot.toISOString().slice(0, 10)
      : undefined;

    const params = new URLSearchParams({
      s: symbol,
      p: "D",
      b: "5",
      g: "0",
      i: "0",
      r: String(Date.now())
    });

    if (startDate) {
      params.set("st", startDate);
    }

    return `https://stockcharts.com/h-sc/ui?${params.toString()}`;
  }, [isPortfolioView, normalizedSelected, selectedLots]);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <AnimatedCard className="card-sm" delay={0.05}>
          <div className="card-header">
            <h3>Asset Allocation</h3>
          </div>
          <AssetAllocationChart allocation={allocation} totalValue={totalValue} />
          <div className="cash-controls">
            <div className="cash-balance">
              Cash Balance: {formatCurrency(cashBalance)}
            </div>
            <div className="cash-actions">
              <input
                className="cash-input"
                type="number"
                min="0"
                step="1"
                placeholder="Cash amount"
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value)}
              />
              <button
                className="btn"
                type="button"
                onClick={handleAddCash}
                disabled={!isValidAmount}
              >
                Add Cash
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={handleRemoveCash}
                disabled={!isValidAmount}
              >
                Remove Cash
              </button>
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard className="card-lg" delay={0.1}>
          <div className="card-header">
            <h3>Portfolio Performance</h3>
            <select
              className="chart-select"
              value={normalizedSelected}
              onChange={(event) => setSelectedSymbol(event.target.value)}
            >
              <option value="PORTFOLIO">Portfolio</option>
              {holdingSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
          {isPortfolioView ? (
            portfolioHistory.length > 0 ? (
              <PerformanceChart history={portfolioHistory} />
            ) : (
              <div className="chart-empty">
                No portfolio history available yet.
              </div>
            )
          ) : (
            <div className="chart-embed">
              <iframe
                title={`${normalizedSelected} StockCharts`}
                src={stockChartsUrl}
                loading="lazy"
                frameBorder="0"
              />
            </div>
          )}
        </AnimatedCard>
      </div>

      <AnimatedCard className="table-card" delay={0.15}>
        <div className="card-header">
          <h3>Holdings</h3>
        </div>
        <HoldingsTable
          rows={assets}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
        />
      </AnimatedCard>

      <SummaryCards cards={summaryCards} />
    </div>
  );
};

export default Dashboard;
