import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HoldingsPage from "./components/HoldingsPage";
import PerformancePage from "./components/PerformancePage";
import SettingsPage from "./components/SettingsPage";
import WatchlistTab from './components/WathlistTab';
import {
  getAllAssets,
  getPortfolioPerformance,
  getPortfolioHistory,
  buyAsset,
  sellAsset
} from "./services/api";

const DEFAULT_CASH_BALANCE = 3268.03;

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
  const location = useLocation();
  const isDashboardRoute = location.pathname === "/";
  const [performance, setPerformance] = useState(null);
  const [allAssets, setAllAssets] = useState([]);           // full assets from GET /portfolio
  const [mergedAssets, setMergedAssets] = useState([]);     // merged result we'll pass to tables
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [cashBalance, setCashBalance] = useState(DEFAULT_CASH_BALANCE);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    symbol: "",
    type: "STOCK",
    quantity: "",
    purchaseDate: "",
    maxQuantity: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async (options = {}) => {
    const { showLoading = true } = options;
    if (showLoading) {
      setLoading(true);
    }
    try {
      const [assetsResponse, performanceResponse, historyResponse] = await Promise.all([
        getAllAssets(),
        getPortfolioPerformance(),
        getPortfolioHistory()
      ]);

      setAllAssets(assetsResponse || []);
      setPerformance(performanceResponse);
      setPortfolioValue(Number(performanceResponse.currentValue || 0));

      // Merge logic: enrich allAssets with performance data
      const performanceMap = new Map(
        (performanceResponse?.assets || [])
          .filter(asset => asset.id !== undefined && asset.id !== null)
          .map(asset => [asset.id, asset])
      );

      const merged = (assetsResponse || []).map(asset => {
        const perf = performanceMap.get(asset.id);
        return {
          ...asset,                           // id, buyTime, assetType, buyPrice, quantity
          type: perf?.type || normalizeType(asset.assetType),
          currentPrice: perf?.currentPrice || 0,
          invested: perf?.invested || Number(asset.buyPrice) * Number(asset.quantity),
          currentValue: perf?.currentValue || 0,
          pnl: perf?.pnl || 0,
          pnlPercent: perf?.pnlPercent || 0
        };
      });

      setMergedAssets(merged);
      setHistory(Array.isArray(historyResponse) ? historyResponse : []);

    } catch (error) {
      console.error("Failed to load portfolio data:", error);
      setFormError("Failed to load portfolio data. Please try again later.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData({ showLoading: true });
  }, []);

  const totals = useMemo(
    () => buildTotalsByType(mergedAssets),
    [mergedAssets]
  );

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

  const totalValueWithCash = Number(portfolioValue || 0) + Number(cashBalance || 0);

  const handleAddCash = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) return;
    setCashBalance((prev) => prev + value);
  };

  const handleRemoveCash = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) return;
    setCashBalance((prev) => Math.max(0, prev - value));
  };

  const openAddModal = () => {
    setFormState({ id: null, symbol: "", type: "STOCK", quantity: "", purchaseDate: "", maxQuantity: "" });
    setFormError("");
    setIsAddOpen(true);
  };

  const openRemoveForAsset = (asset) => {
    const assetQty = Number(asset?.quantity || 0);
    setFormState({
      id: asset?.id ?? null,
      symbol: (asset?.symbol || "").toUpperCase(),
      type: "STOCK",
      quantity: assetQty ? assetQty.toString() : "",
      purchaseDate: "",
      maxQuantity: assetQty ? assetQty.toString() : ""
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

    if (isAddOpen && (!formState.symbol || !formState.quantity)) {
      setFormError("Symbol and quantity are required.");
      setIsSubmitting(false);
      return;
    }

    if (isAddOpen && !formState.purchaseDate) {
      setFormError("Purchase date is required when adding.");
      setIsSubmitting(false);
      return;
    }

    if (isAddOpen) {
      const quantityValue = Number(formState.quantity);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        setFormError("Quantity must be a positive number.");
        setIsSubmitting(false);
        return;
      }
    }
    if (isRemoveOpen) {
      const quantityValue = Number(formState.quantity);
      const maxValue = Number(formState.maxQuantity);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        setFormError("Quantity must be a positive number.");
        setIsSubmitting(false);
        return;
      }
      if (!isNaN(maxValue) && maxValue > 0 && quantityValue > maxValue) {
        setFormError("Quantity cannot exceed available quantity.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        id: formState.id,
        symbol: formState.symbol.toUpperCase(),
        type: formState.type,
        quantity: isAddOpen ? Number(formState.quantity) : undefined,
        purchaseDate: formState.purchaseDate
      };

      if (isAddOpen) {
        await buyAsset(payload);
      } else if (isRemoveOpen) {
        if (!payload.id) {
          throw new Error("Missing asset id for removal.");
        }
        await sellAsset({ id: payload.id, quantity: Number(formState.quantity) });
      }

      await loadData({ showLoading: false });
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
        {isDashboardRoute && (
          <Header
            totalValue={formatCurrency(totalValueWithCash)}
            totalReturn={formatPercent(performance?.profitLossPercent || 0)}
            onAdd={openAddModal}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <section id="dashboard" className="page-section">
                <Dashboard
                  allocation={assetAllocation}
                  assets={mergedAssets}
                  history={history}
                  summaryCards={summaryCards}
                  totalValue={formatCurrency(totalValueWithCash)}
                  cashBalance={cashBalance}
                  onAddCash={handleAddCash}
                  onRemoveCash={handleRemoveCash}
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
                assets={mergedAssets}                  // ← now merged, has both basic + performance fields
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
                onRemoveAsset={openRemoveForAsset}
              />
            }
          />
          <Route
            path="/performance"
            element={
              <PerformancePage
                history={history}
                performance={performance || {}}
                assets={mergedAssets}
                totalValue={portfolioValue}
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/watchlist" element={<WatchlistTab />} />
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
                  disabled={isSubmitting || isRemoveOpen}
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

              {isAddOpen && (
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
              )}

              {isRemoveOpen && (
                <label className="form-field">
                  <span>Quantity to sell</span>
                  <input
                    name="quantity"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max={formState.maxQuantity || undefined}
                    value={formState.quantity}
                    onChange={handleInputChange}
                    placeholder={formState.maxQuantity ? `Max ${formState.maxQuantity}` : "0.1"}
                    disabled={isSubmitting}
                  />
                </label>
              )}

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
