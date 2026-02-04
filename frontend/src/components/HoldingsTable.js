import React from "react";
import { motion } from "framer-motion";

const resolveType = (type) => {
  if (!type) return "-";
  if (type === "BOND_ETF") return "BOND";
  return type;
};

const HoldingsTable = ({ rows, formatCurrency, formatPercent }) => {
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
            <th>Market Value</th>
            <th>P/L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const currentPrice = Number(row.currentPrice || 0);
            const marketValue = Number(row.currentValue || currentPrice * row.quantity);
            const pnl = Number(row.pnl || marketValue - row.invested || 0);
            const pnlPercent = Number(row.pnlPercent || 0);
            const isProfit = pnl >= 0;

            return (
              <motion.tr
                key={`${row.symbol}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <td className="symbol">{row.symbol}</td>
                <td>{resolveType(row.type || row.assetType)}</td>
                <td>{row.quantity}</td>
                <td>{formatCurrency(currentPrice)}</td>
                <td>{formatCurrency(row.buyPrice)}</td>
                <td>{formatCurrency(marketValue)}</td>
                <td className={isProfit ? "profit" : "loss"}>
                  {formatCurrency(pnl)}
                  <span className="pnl-percent">{formatPercent(pnlPercent)}</span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;
