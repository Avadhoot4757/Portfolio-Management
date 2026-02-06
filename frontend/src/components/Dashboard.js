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
          </div>
          {history && history.length > 0 ? (
            <PerformanceChart
              history={history}
              investedSeries={history.map((item) => item.invested)}
              investedLabel="Invested"
            />
          ) : (
            <div className="chart-empty">
              No portfolio history available yet.
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
