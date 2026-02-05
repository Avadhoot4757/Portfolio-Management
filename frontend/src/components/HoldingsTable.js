import React from "react";
import { motion } from "framer-motion";

const resolveType = (type) => {
  if (!type) return "-";
  if (type === "BOND_ETF") return "BOND";
  return type;
};

// Simple fallback formatter if prop is not passed
const defaultFormatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const HoldingsTable = ({
  rows,
  formatCurrency,
  formatPercent,
  formatDate = defaultFormatDate,
  showRemove,
  onRemove,
  onRowClick,
  selectedSymbol
}) => {
  // ────────────────────────────────────────────────
  // Add these logs to see the incoming data
  console.log("HoldingsTable received rows:", rows);
  console.log("Number of assets:", rows?.length || 0);
  console.log("Selected symbol:", selectedSymbol);
  console.log("showRemove:", showRemove);
  // Optional: log first row structure if exists
  if (rows?.length > 0) {
    console.log("First row sample:", rows[0]);
  }
  // ────────────────────────────────────────────────

  return (
    <div className="table-wrap">
      <table className="holdings-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Asset Type</th>
            <th>Quantity</th>
            <th>Current Price</th>
            <th>Cost Basis</th>
            <th>Purchase Date</th>
            <th>Market Value</th>
            <th>P/L</th>
            {showRemove && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const currentPrice = Number(row.currentPrice || 0);
            const marketValue = Number(row.currentValue || currentPrice * row.quantity);
            const pnl = Number(row.pnl || marketValue - row.invested || 0);
            const pnlPercent = Number(row.pnlPercent || 0);
            const isProfit = pnl >= 0;
            const isSelected =
              selectedSymbol && String(row.symbol || "").toUpperCase() === selectedSymbol;

            return (
              <motion.tr
                key={`${row.symbol}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`${onRowClick ? "row-clickable" : ""} ${
                  isSelected ? "row-selected" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                <td className="symbol">{row.symbol}</td>
                <td>{resolveType(row.type || row.assetType)}</td>
                <td>{row.quantity}</td>
                <td>{formatCurrency(currentPrice)}</td>
                <td>{formatCurrency(row.buyPrice)}</td>
                <td>{formatDate(row.buyTime)}</td>
                <td>{formatCurrency(marketValue)}</td>
                <td className={isProfit ? "profit" : "loss"}>
                  {formatCurrency(pnl)}
                  <span className="pnl-percent">{formatPercent(pnlPercent)}</span>
                </td>
                {showRemove && (
                  <td>
                    <button
                      className="table-action"
                      type="button"
                      onClick={() => onRemove?.(row.symbol)}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;