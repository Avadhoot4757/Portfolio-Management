import React, { useMemo, useState } from "react";
import AnimatedCard from "./AnimatedCard";
import HoldingsTable from "./HoldingsTable";
import SummaryCards from "./SummaryCards";

const resolveMarketValue = (row) => {
  const currentPrice = Number(row.currentPrice || 0);
  const quantity = Number(row.quantity || 0);
  const currentValue = Number(row.currentValue || 0);
  return currentValue || currentPrice * quantity;
};

const resolveCostBasis = (row) => {
  const invested = Number(row.invested || 0);
  if (invested) return invested;
  const buyPrice = Number(row.buyPrice || 0);
  const quantity = Number(row.quantity || 0);
  return buyPrice * quantity;
};

const HoldingsPage = ({ assets, formatCurrency, formatPercent, onRemoveAsset }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const summaryCards = useMemo(() => {
    const totals = assets.reduce(
      (acc, row) => {
        const marketValue = resolveMarketValue(row);
        const costBasis = resolveCostBasis(row);
        acc.marketValue += marketValue;
        acc.costBasis += costBasis;
        return acc;
      },
      { marketValue: 0, costBasis: 0 }
    );

    const totalPnl = totals.marketValue - totals.costBasis;
    const totalPnlPercent =
      totals.costBasis > 0 ? (totalPnl / totals.costBasis) * 100 : 0;

    return [
      { label: "Positions", value: String(assets.length) },
      { label: "Cost Basis", value: formatCurrency(totals.costBasis) },
      { label: "Market Value", value: formatCurrency(totals.marketValue) },
      { label: "Total P/L", value: `${formatCurrency(totalPnl)} (${formatPercent(totalPnlPercent)})` }
    ];
  }, [assets, formatCurrency, formatPercent]);

  const filteredAssets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return assets.filter((row) => {
      const symbol = String(row.symbol || "").toLowerCase();
      const type = String(row.type || row.assetType || "").toLowerCase();
      const matchesSearch = !query || symbol.includes(query) || type.includes(query);
      const matchesFilter =
        activeFilter === "ALL" || type === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [assets, searchTerm, activeFilter]);

  const filterOptions = [
    { label: "All", value: "ALL" },
    { label: "Stocks", value: "STOCK" },
    { label: "Bonds", value: "BOND" },
    { label: "Crypto", value: "CRYPTO" }
  ];

  return (
    <section id="holdings" className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Holdings</h2>
          <p className="section-subtitle">
            Track every position, cost basis, and performance in one place.
          </p>
        </div>
        <div className="section-meta">
          <span className="meta-label">Active positions</span>
          <span className="meta-value">{assets.length}</span>
        </div>
      </div>

      <SummaryCards cards={summaryCards} />

      <AnimatedCard className="table-card" delay={0.1}>
        <div className="card-header table-header">
          <div>
            <h3>Positions</h3>
            <div className="table-filters">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-pill ${
                    activeFilter === option.value ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="table-search-wrap">
            <input
              className="table-search"
              placeholder="Search symbol or type"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                className="table-search-clear"
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <HoldingsTable
          rows={filteredAssets}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          showRemove
          onRemove={onRemoveAsset}
        />
      </AnimatedCard>
    </section>
  );
};

export default HoldingsPage;
