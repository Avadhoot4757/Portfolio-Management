import React from "react";
import AnimatedCard from "./AnimatedCard";
import AssetAllocationChart from "./AssetAllocationChart";
import PerformanceChart from "./PerformanceChart";
import HoldingsTable from "./HoldingsTable";
import SummaryCards from "./SummaryCards";

const Dashboard = ({
  allocation,
  performance,
  history,
  summaryCards,
  totalValue,
  formatCurrency,
  formatPercent
}) => {
  const assets = performance.assets || [];

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <AnimatedCard className="card-sm" delay={0.05}>
          <div className="card-header">
            <h3>Asset Allocation</h3>
          </div>
          <AssetAllocationChart allocation={allocation} totalValue={totalValue} />
        </AnimatedCard>
        <AnimatedCard className="card-lg" delay={0.1}>
          <div className="card-header">
            <h3>Portfolio Performance</h3>
          </div>
          <PerformanceChart history={history} />
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
