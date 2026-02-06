// WatchlistTab.jsx
import React, { useEffect, useMemo, useState } from "react";
import AnimatedCard from "./AnimatedCard";
import {
  getWatchlist,
  getWatchlistQuote,
  addToWatchlist,
  removeFromWatchlist,
  getSectorCatalog,
  getWatchlistSectors,
  addWatchlistSector,
  removeWatchlistSector
} from "../services/api";

function WatchlistTab() {
  const [watchlist, setWatchlist] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('STOCK');
  const [quotes, setQuotes] = useState({});
  const [quoteLoading, setQuoteLoading] = useState({});
  const [showList, setShowList] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [sectorCatalog, setSectorCatalog] = useState([]);
  const [watchlistSectors, setWatchlistSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");

  const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
  const FINNHUB_BASE_URL = "/api/v1";

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
      }),
    []
  );

  const formatNewsDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const placeholderNews = useMemo(
    () => [
      {
        id: "placeholder-1",
        symbol: "AAPL",
        headline: "Apple explores new AI-driven portfolio insights",
        summary:
          "Analysts expect new tools to help retail investors track performance.",
        url: "https://finnhub.io",
        image: "",
        datetime: Math.floor(Date.now() / 1000)
      },
      {
        id: "placeholder-2",
        symbol: "TSLA",
        headline: "EV market sentiment shifts as deliveries update arrives",
        summary:
          "Watch how momentum names are reacting to the latest production figures.",
        url: "https://finnhub.io",
        image: "",
        datetime: Math.floor(Date.now() / 1000) - 86400
      },
      {
        id: "placeholder-3",
        symbol: "BTC",
        headline: "Crypto market steadies ahead of macro data",
        summary:
          "Traders await macro headlines that could swing risk appetite.",
        url: "https://finnhub.io",
        image: "",
        datetime: Math.floor(Date.now() / 1000) - 172800
      }
    ],
    []
  );

  const refresh = () => {
    Promise.all([getWatchlist(), getWatchlistSectors(), getSectorCatalog()]).then(
      ([watchlistData, sectorsData, catalogData]) => {
        setWatchlist(watchlistData || []);
        setWatchlistSectors(sectorsData || []);
        setSectorCatalog(catalogData || []);
        if (!selectedSector && Array.isArray(catalogData) && catalogData.length) {
          setSelectedSector(catalogData[0]);
        }
      }
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const symbols = watchlist
      .map((item) => String(item.symbol || "").toUpperCase())
      .filter(Boolean);
    const sectors = watchlistSectors
      .map((item) => String(item.name || ""))
      .filter(Boolean);
    if (symbols.length === 0 && sectors.length === 0) {
      setNewsItems(placeholderNews);
      return;
    }
    fetchNews(symbols, sectors);
  }, [watchlist, watchlistSectors, placeholderNews]);

  const handleAdd = () => {
    if (!symbol) return;
    addToWatchlist(symbol, type).then(() => {
      setSymbol('');
      refresh();
    });
  };

  const handleAddSector = () => {
    if (!selectedSector) return;
    addWatchlistSector(selectedSector).then(() => refresh());
  };

  const handleRemoveSector = (name) => {
    removeWatchlistSector(name).then(() => refresh());
  };

  const handleRemove = (symbol) => {
    removeFromWatchlist(symbol).then(() => {
      setQuotes((prev) => {
        const next = { ...prev };
        delete next[symbol.toUpperCase()];
        return next;
      });
      refresh();
    });
  };

  const handleView = async (symbolToView) => {
    const key = symbolToView.toUpperCase();
    setQuoteLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const quote = await getWatchlistQuote(key);
      setQuotes((prev) => ({ ...prev, [key]: quote }));
    } finally {
      setQuoteLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const sectorKeywords = useMemo(
    () => ({
      Technology: ["TECH", "SOFTWARE", "SEMICONDUCTOR", "IT", "CLOUD"],
      Financials: ["BANK", "FINANCIAL", "FINTECH", "LENDER", "INSURANCE"],
      Healthcare: ["HEALTH", "BIOTECH", "PHARMA", "MEDICAL"],
      Industrials: ["INDUSTRIAL", "MANUFACTURING", "DEFENSE", "AEROSPACE"],
      Energy: ["ENERGY", "OIL", "GAS", "POWER"],
      Utilities: ["UTILITY", "ELECTRIC", "WATER", "GRID"],
      Materials: ["MATERIAL", "MINING", "METAL", "CHEMICAL"],
      "Real Estate": ["REAL ESTATE", "REIT", "PROPERTY"],
      "Consumer Discretionary": ["RETAIL", "CONSUMER", "AUTOMAKER", "APPAREL"],
      "Consumer Staples": ["STAPLES", "GROCERY", "FOOD", "BEVERAGE"],
      "Communication Services": ["MEDIA", "TELECOM", "STREAMING"]
    }),
    []
  );

  const fetchNews = async (symbols, sectors) => {
    if ((!symbols.length && !sectors.length) || !FINNHUB_API_KEY) {
      setNewsItems(placeholderNews);
      return;
    }

    setNewsLoading(true);
    setNewsError("");
    try {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 7);

      const to = today.toISOString().slice(0, 10);
      const from = fromDate.toISOString().slice(0, 10);

      const responses = await Promise.all(
        symbols.map(async (symbol) => {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(
            symbol
          )}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load news");
          const data = await res.json();
          const normalizedSymbol = String(symbol || "").toUpperCase();
          const items = Array.isArray(data) ? data : [];
          const filtered = items.filter((item) => {
            const related = String(item.related || "").toUpperCase();
            const headline = String(item.headline || "").toUpperCase();
            const summary = String(item.summary || "").toUpperCase();
            return (
              related.includes(normalizedSymbol) ||
              headline.includes(normalizedSymbol) ||
              summary.includes(normalizedSymbol)
            );
          });
          const scoped = (filtered.length ? filtered : items)
            .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
            .slice(0, 3);
          return scoped.map((item) => ({
            ...item,
            symbol: normalizedSymbol
          }));
        })
      );

      let merged = responses.flat();

      if (sectors.length) {
        const sectorUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
        const sectorRes = await fetch(sectorUrl);
        if (!sectorRes.ok) throw new Error("Failed to load sector news");
        const sectorData = await sectorRes.json();
        const sectorItems = Array.isArray(sectorData) ? sectorData : [];

        const sectorScoped = sectors.flatMap((sector) => {
          const key = String(sector || "");
          const normalized = key.toUpperCase();
          const keywords = (sectorKeywords[key] || []).map((word) => word.toUpperCase());
          const matches = (item) => {
            const text = `${item.headline || ""} ${item.summary || ""}`.toUpperCase();
            if (text.includes(normalized)) return true;
            return keywords.some((word) => text.includes(word));
          };
          const filtered = sectorItems.filter(matches);
          return (filtered.length ? filtered : sectorItems)
            .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
            .slice(0, 3)
            .map((item) => ({
              ...item,
              symbol: sector
            }));
        });

        merged = merged.concat(sectorScoped);
      }
      const unique = new Map();
      merged.forEach((item) => {
        if (item.url && !unique.has(item.url)) {
          unique.set(item.url, item);
        }
      });

      const sorted = Array.from(unique.values()).sort(
        (a, b) => (b.datetime || 0) - (a.datetime || 0)
      );

      setNewsItems(sorted.slice(0, 12));
    } catch (error) {
      setNewsError("Unable to load live news. Showing placeholders.");
      setNewsItems(placeholderNews);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <section id="watchlist" className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Watchlist</h2>
          <p className="section-subtitle">
            Track assets before you decide to buy.
          </p>
        </div>
        <div className="section-meta">
          <span className="meta-label">Tracked symbols</span>
          <span className="meta-value">{watchlist.length}</span>
        </div>
      </div>

      <AnimatedCard className="table-card" delay={0.1}>
        <div className="card-header table-header">
          <div>
            <h3>Watchlist</h3>
          </div>
          <button
            className="card-action"
            type="button"
            onClick={() => setShowList((prev) => !prev)}
          >
            {showList ? "Hide List" : "Show List"}
          </button>
        </div>
        {showList ? (
          <>
            <div className="table-wrap">
              <div className="watchlist-form watchlist-form-compact">
                <label className="form-field">
                  <span>Symbol</span>
                  <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. AAPL"
                  />
                </label>
                <label className="form-field">
                  <span>Type</span>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="STOCK">Stock</option>
                    <option value="BOND">Bond</option>
                    <option value="CRYPTO">Crypto</option>
                  </select>
                </label>
                <button
                  className="btn"
                  type="button"
                  onClick={handleAdd}
                  disabled={!symbol.trim()}
                >
                  Add Asset
                </button>
              </div>
              <div className="watchlist-sector-row">
                <div className="watchlist-sector-label">Sectors</div>
                <div className="watchlist-sector-actions">
                  <select
                    className="watchlist-sector-select"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    {sectorCatalog.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                  <button
                    className="table-action"
                    type="button"
                    onClick={handleAddSector}
                    disabled={!selectedSector}
                  >
                    Add Sector
                  </button>
                </div>
              </div>
              <div className="watchlist-sector-list">
                {watchlistSectors.length === 0 ? (
                  <span className="watchlist-sector-empty">No sectors added yet.</span>
                ) : (
                  watchlistSectors.map((sector) => (
                    <div key={sector.id || sector.name} className="watchlist-sector-chip">
                      <span>{sector.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${sector.name}`}
                        onClick={() => handleRemoveSector(sector.name)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {watchlist.length === 0 ? (
              <div className="chart-empty">No assets in the watchlist yet.</div>
            ) : (
              <div className="table-wrap">
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Live Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((item) => (
                      <tr key={item.symbol}>
                        <td className="symbol">{item.symbol}</td>
                        <td>{item.assetType || "—"}</td>
                        <td>
                          {quotes[item.symbol?.toUpperCase()]
                            ? formatCurrency.format(
                                Number(quotes[item.symbol.toUpperCase()].price)
                              )
                            : "—"}
                        </td>
                        <td>
                          <div className="watchlist-actions">
                            <button
                              className="table-action"
                              type="button"
                              onClick={() => handleView(item.symbol)}
                              disabled={quoteLoading[item.symbol?.toUpperCase()]}
                            >
                              {quoteLoading[item.symbol?.toUpperCase()]
                                ? "Loading..."
                                : "View"}
                            </button>
                            <button
                              className="table-action"
                              type="button"
                              onClick={() => handleRemove(item.symbol)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </AnimatedCard>

      <AnimatedCard className="card" delay={0.15}>
        <div className="card-header">
          <div>
            <h3>Watchlist News</h3>
            <p className="section-subtitle">
              Top headlines for your tracked tickers and sectors.
            </p>
          </div>
          {newsLoading && <span className="news-status">Loading…</span>}
        </div>
        {newsError && <div className="news-error">{newsError}</div>}
        <div className="news-grid">
          {(newsItems.length ? newsItems : placeholderNews).map((item) => (
            <a
              key={item.id || item.url}
              className="news-card"
              href={item.url || "https://finnhub.io"}
              target="_blank"
              rel="noreferrer"
            >
              <div className="news-media">
                {item.image ? (
                  <img src={item.image} alt={item.headline} />
                ) : (
                  <div className="news-placeholder">No image</div>
                )}
              </div>
              <div className="news-body">
                <div className="news-meta">
                  <span>{item.symbol || "Watchlist"}</span>
                  <span>{formatNewsDate(item.datetime)}</span>
                </div>
                <h4>{item.headline || "Market update"}</h4>
                <p>{item.summary || "Read the latest update."}</p>
                <span className="news-link">Read article</span>
              </div>
            </a>
          ))}
        </div>
      </AnimatedCard>
    </section>
  );
}

export default WatchlistTab;
