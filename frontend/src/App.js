import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HoldingsPage from "./components/HoldingsPage";
import PerformancePage from "./components/PerformancePage";
import {
  getPortfolioPerformance,
  getPortfolioValue,
  buyAsset,
  sellAsset
} from "./services/api";

const DEFAULT_CASH_BALANCE = 25000;

const MOCK_PERFORMANCE = {
  totalInvested: 120000,
  currentValue: 134500,
  profitLoss: 14500,
  profitLossPercent: 12.08,
  assets: [
    {
      symbol: "AAPL",
      type: "STOCK",
      quantity: 20,
      buyPrice: 140,
      currentPrice: 175,
      invested: 2800,
      currentValue: 3500,
      pnl: 700,
      pnlPercent: 25
    },
    {
      symbol: "VOO",
      type: "BOND",
      quantity: 35,
      buyPrice: 385,
      currentPrice: 405,
      invested: 13475,
      currentValue: 14175,
      pnl: 700,
      pnlPercent: 5.19
    },
    {
      symbol: "BTC-USD",
      type: "CRYPTO",
      quantity: 0.8,
      buyPrice: 32000,
      currentPrice: 36500,
      invested: 25600,
      currentValue: 29200,
      pnl: 3600,
      pnlPercent: 14.06
    },
    {
      symbol: "MSFT",
      type: "STOCK",
      quantity: 12,
      buyPrice: 290,
      currentPrice: 330,
      invested: 3480,
      currentValue: 3960,
      pnl: 480,
      pnlPercent: 13.79
    }
  ]
};

const MOCK_HISTORY = [
  { date: "Jan 05", value: 98000 },
  { date: "Jan 12", value: 102500 },
  { date: "Jan 19", value: 101200 },
  { date: "Jan 26", value: 108400 },
  { date: "Feb 02", value: 112700 },
  { date: "Feb 09", value: 118200 },
  { date: "Feb 16", value: 121300 },
  { date: "Feb 23", value: 125800 },
  { date: "Mar 02", value: 129600 },
  { date: "Mar 09", value: 134500 }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const formatPercent = (value) =>
  `${Number(value || 0).toFixed(2)}%`;

const normalizeType = (type) => {
  if (!type) return "UNKNOWN";
  if (type === "BOND_ETF") return "BOND";
  return type;
};

const buildTotalsByType = (assets) => {
  return assets.reduce(
    (acc, asset) => {
      const type = normalizeType(asset.type || asset.assetType);
      const currentValue = Number(asset.currentValue || 0);

      if (type === "STOCK") acc.stocks += currentValue;
      if (type === "BOND") acc.bonds += currentValue;
      if (type === "CRYPTO") acc.crypto += currentValue;

      return acc;
    },
    { stocks: 0, bonds: 0, crypto: 0 }
  );
};

const resolvePortfolioValue = (valueResponse, performance) => {
  if (typeof valueResponse === "number") return valueResponse;
  if (valueResponse && typeof valueResponse === "object") {
    const parsed = Number(valueResponse.value || valueResponse.total);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Number(performance.currentValue || 0);
};

const App = () => {
  const [performance, setPerformance] = useState(MOCK_PERFORMANCE);
  const [portfolioValue, setPortfolioValue] = useState(MOCK_PERFORMANCE.currentValue);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [cashBalance, setCashBalance] = useState(DEFAULT_CASH_BALANCE);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [formState, setFormState] = useState({
    symbol: "",
    type: "STOCK",
    quantity: "",
    purchaseDate: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [performanceRes, valueRes] = await Promise.all([
        getPortfolioPerformance(),
        getPortfolioValue()
      ]);

      const performanceData = performanceRes?.data || performanceRes;
      const valueData = valueRes?.data || valueRes;

      if (performanceData) {
        setPerformance(performanceData);
        setPortfolioValue(resolvePortfolioValue(valueData, performanceData));
      }
    } catch (error) {
      setPerformance(MOCK_PERFORMANCE);
      setPortfolioValue(MOCK_PERFORMANCE.currentValue);
      setHistory(MOCK_HISTORY);
      setCashBalance(DEFAULT_CASH_BALANCE);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;
      await loadData();
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const totals = useMemo(
    () => buildTotalsByType(performance.assets || []),
    [performance]
  );
  const assets = useMemo(() => performance.assets || [], [performance]);

  const summaryCards = useMemo(
    () => [
      { label: "Cash Balance", value: formatCurrency(cashBalance) },
      { label: "Stocks Value", value: formatCurrency(totals.stocks) },
      { label: "Bonds Value", value: formatCurrency(totals.bonds) },
      { label: "Crypto Value", value: formatCurrency(totals.crypto) }
    ],
    [cashBalance, totals]
  );

  const assetAllocation = useMemo(() => {
    return {
      labels: ["Stocks", "Bonds", "Crypto", "Cash"],
      values: [totals.stocks, totals.bonds, totals.crypto, cashBalance]
    };
  }, [totals, cashBalance]);

  const openAddModal = () => {
    setFormState({ symbol: "", type: "STOCK", quantity: "", purchaseDate: "" });
    setFormError("");
    setIsAddOpen(true);
  };

  const openRemoveForSymbol = (symbol) => {
    setFormState({
      symbol: (symbol || "").toUpperCase(),
      type: "STOCK",
      quantity: "",
      purchaseDate: ""
    });
    setFormError("");
    setIsRemoveOpen(true);
  };

  const closeModals = () => {
    setIsAddOpen(false);
    setIsRemoveOpen(false);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resolveApiType = (type) => {
    if (type === "BOND_ETF") return "BOND";
    return type;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formState.symbol || !formState.quantity) {
      setFormError("Please provide a symbol and quantity.");
      return;
    }

    if (isAddOpen && !formState.purchaseDate) {
      setFormError("Please provide the purchase date.");
      return;
    }

    const quantityValue = Number(formState.quantity);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      setFormError("Quantity must be a positive number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        symbol: formState.symbol.toUpperCase(),
        type: resolveApiType(formState.type),
        quantity: quantityValue,
        purchaseDate: formState.purchaseDate
      };

      if (isAddOpen) {
        await buyAsset(payload);
      }

      if (isRemoveOpen) {
        await sellAsset({ symbol: payload.symbol, quantity: payload.quantity });
      }

      await loadData();
      closeModals();
    } catch (error) {
      setFormError("Unable to submit the request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content">
        <Header
          totalValue={formatCurrency(portfolioValue)}
          totalReturn={formatPercent(performance.profitLossPercent)}
          onAdd={openAddModal}
        />
        <Routes>
          <Route
            path="/"
            element={
              <section id="dashboard" className="page-section">
                <Dashboard
                  allocation={assetAllocation}
                  assets={assets}
                  history={history}
                  summaryCards={summaryCards}
                  totalValue={formatCurrency(portfolioValue)}
                  formatCurrency={formatCurrency}
                  formatPercent={formatPercent}
                />
              </section>
            }
          />
          <Route
            path="/holdings"
            element={
              <HoldingsPage
                assets={assets}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
                onRemoveAsset={openRemoveForSymbol}
              />
            }
          />
          <Route
            path="/performance"
            element={
              <PerformancePage
                history={history}
                performance={performance}
                totalValue={portfolioValue}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {(isAddOpen || isRemoveOpen) && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{isAddOpen ? "Add Asset" : "Remove Asset"}</h3>
              <button className="modal-close" onClick={closeModals} type="button">
                ×
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Symbol</span>
                <input
                  name="symbol"
                  value={formState.symbol}
                  onChange={handleInputChange}
                  placeholder="AAPL, BTC-USD, VOO"
                />
              </label>
              {isAddOpen && (
                <label className="form-field">
                  <span>Asset Type</span>
                  <select name="type" value={formState.type} onChange={handleInputChange}>
                    <option value="STOCK">Stock</option>
                    <option value="BOND">Bond ETF</option>
                    <option value="CRYPTO">Crypto</option>
                  </select>
                </label>
              )}
              <label className="form-field">
                <span>Quantity</span>
                <input
                  name="quantity"
                  value={formState.quantity}
                  onChange={handleInputChange}
                  placeholder="10"
                  type="number"
                  step="0.0001"
                />
              </label>
              {isAddOpen && (
                <label className="form-field">
                  <span>Purchase Date</span>
                  <input
                    name="purchaseDate"
                    value={formState.purchaseDate}
                    onChange={handleInputChange}
                    type="date"
                  />
                </label>
              )}

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button className="btn secondary" type="button" onClick={closeModals}>
                  Cancel
                </button>
                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
