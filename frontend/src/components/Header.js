import React from "react";

const Header = ({ totalValue, totalReturn, onAdd, onRemove }) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="app-title">Portfolio</div>
        <div className="app-subtitle">Dashboard Overview</div>
      </div>
      <div className="header-center">
        <div className="metric">
          <span className="metric-label">Total Value</span>
          <span className="metric-value">{totalValue}</span>
        </div>
        <span className="return-pill">{totalReturn}</span>
      </div>
      <div className="header-actions">
        <button className="btn" onClick={onAdd} type="button">Add Asset</button>
        <button className="btn secondary" onClick={onRemove} type="button">
          Remove
        </button>
      </div>
    </header>
  );
};

export default Header;
