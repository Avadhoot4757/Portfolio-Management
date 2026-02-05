import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HoldingsPage from "./components/HoldingsPage";
import PerformancePage from "./components/PerformancePage";
import SettingsPage from "./components/SettingsPage";
import {
  getAllAssets,
  getPortfolioPerformance,
  buyAsset,
  sellAsset
} from "./services/api";

const DEFAULT_CASH_BALANCE = 25000; // ← keep until you have a real cash endpoint

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
      const type = normalizeType(asset.assetType || asset.type);
      const currentValue = Number(asset.currentValue || 0);

      if (type === "STOCK") acc.stocks += currentValue;
      if (type === "BOND") acc.bonds += currentValue;
      if (type === "CRYPTO") acc.crypto += currentValue;

      return acc;
    },
    { stocks: 0, bonds: 0, crypto: 0 }
  );
};

const App = () => {
  const [performance, setPerformance] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [history, setHistory] = useState([]); // ← still mock / empty until you add history endpoint
  const [cashBalance, setCashBalance] = useState(DEFAULT_CASH_BALANCE); // ← placeholder
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
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsResponse, performanceResponse] = await Promise.all([
        getAllAssets(),
        getPortfolioPerformance()
      ]);

      // performanceResponse should match your example:
      // { totalInvested, currentValue, profitLoss, profitLossPercent, assets: [...] }
      setPerformance(performanceResponse);
      setPortfolioValue(Number(performanceResponse.currentValue || 0));

      // If you later add a cash balance endpoint, fetch it here:
      // const cash = await getCashBalance();
      // setCashBalance(cash);

      // History still mocked — replace when you have real data
      // setHistory(realHistory);
    } catch (error) {
      console.error("Failed to load portfolio data:", error);
      setFormError("Failed to load portfolio data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Optional: auto-refresh every 30–60 seconds
    // const interval = setInterval(loadData, 60000);
    // return () => clearInterval(interval);
  }, []);

  const totals = useMemo(
    () => buildTotalsByType(performance?.assets || []),
    [performance]
  );

  const assets = useMemo(() => performance?.assets || [], [performance]);

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
    setIsSubmitting(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    if (!formState.symbol || !formState.quantity) {
      setFormError("Symbol and quantity are required.");
      setIsSubmitting(false);
      return;
    }

    if (isAddOpen && !formState.purchaseDate) {
      setFormError("Purchase date is required when adding.");
      setIsSubmitting(false);
      return;
    }

    const quantityValue = Number(formState.quantity);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      setFormError("Quantity must be a positive number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        symbol: formState.symbol.toUpperCase(),
        type: formState.type, // already matches your enum (STOCK, BOND, CRYPTO)
        quantity: quantityValue,
        // purchaseDate is not used by backend yet — can be removed later
        purchaseDate: formState.purchaseDate
      };

      if (isAddOpen) {
        await buyAsset(payload);
      } else if (isRemoveOpen) {
        await sellAsset({
          symbol: payload.symbol,
          quantity: payload.quantity
        });
      }

      await loadData();
      closeModals();
    } catch (error) {
      setFormError(error.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content">
        <Header
          totalValue={formatCurrency(portfolioValue)}
          totalReturn={formatPercent(performance?.profitLossPercent || 0)}
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
                  history={history} // ← still empty/mocked
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
                performance={performance || {}}
                totalValue={portfolioValue}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {(isAddOpen || isRemoveOpen) && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isAddOpen ? "Add Asset" : "Remove / Sell Asset"}</h3>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Symbol</span>
                <input
                  name="symbol"
                  value={formState.symbol}
                  onChange={handleInputChange}
                  placeholder="AAPL, BTC-USD, VOO"
                  disabled={isSubmitting}
                />
              </label>

              {isAddOpen && (
                <label className="form-field">
                  <span>Asset Type</span>
                  <select
                    name="type"
                    value={formState.type}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="STOCK">Stock</option>
                    <option value="BOND">Bond / ETF</option>
                    <option value="CRYPTO">Crypto</option>
                  </select>
                </label>
              )}

              <label className="form-field">
                <span>Quantity</span>
                <input
                  name="quantity"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={formState.quantity}
                  onChange={handleInputChange}
                  placeholder="10"
                  disabled={isSubmitting}
                />
              </label>

              {isAddOpen && (
                <label className="form-field">
                  <span>Purchase Date</span>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={formState.purchaseDate}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}

              {formError && <div className="form-error">{formError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={closeModals}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm"}
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