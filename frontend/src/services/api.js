// src/services/api.js
const API_BASE_URL = "http://localhost:8080";
// const WATCHLIST_BASE_URL  = "http://localhost:8080"; // ← change to your actual backend URL

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(errorText || `HTTP error ${response.status}`);
  }
  // For DELETE requests that return 204 No Content, we return true / nothing
  if (response.status === 204) {
    return true;
  }
  return response.json();
};

// ────────────────────────────────────────────────────────────────
// PORTFOLIO APIs
// ────────────────────────────────────────────────────────────────

export const getAllAssets = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`);
  // Optional: still useful for debugging
  // const clone = response.clone();
  // clone.json().then(data => console.log("getAllAssets Response:", data));
  return handleResponse(response);
};

export const getPortfolioPerformance = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio/value`);
  return handleResponse(response);
};

export const getPortfolioValue = async () => {
  const perf = await getPortfolioPerformance();
  return perf.currentValue;
};

export const buyAsset = async ({ symbol, type, quantity, purchaseDate }) => {
  let buyTimeValue;
  if (purchaseDate) {
    // Convert YYYY-MM-DD to ISO-like string (midnight UTC)
    buyTimeValue = `${purchaseDate}T00:00:00`;
    // Alternative: use current time
    // buyTimeValue = new Date(purchaseDate).toISOString();
  }

  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    type,
    quantity: quantity.toString(),
    ...(buyTimeValue && { buyTime: buyTimeValue }), // only add if present
  });

  const response = await fetch(`${API_BASE_URL}/portfolio/add?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return handleResponse(response);
};

export const sellAsset = async ({ id }) => {
  if (id === undefined || id === null) {
    throw new Error("Asset id is required to remove.");
  }

  const response = await fetch(`${API_BASE_URL}/portfolio/remove/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response); // returns true for 204, or parsed JSON if any
};

// ────────────────────────────────────────────────────────────────
// WATCHLIST APIs  ←  NOW CONSISTENT WITH THE ABOVE STYLE
// ────────────────────────────────────────────────────────────────

/**
 * Get watchlist items (no live prices).
 * @returns {Promise<Array>} Array of watchlist items
 */
export const getWatchlist = async () => {
  const response = await fetch(`${API_BASE_URL}/watchlist`);
  return handleResponse(response);
};

/**
 * Get live price for a single watchlist symbol
 * @param {string} symbol - e.g. "AAPL"
 * @returns {Promise<Object>} Market quote for the symbol
 */
export const getWatchlistQuote = async (symbol) => {
  const response = await fetch(
    `${API_BASE_URL}/watchlist/quote/${encodeURIComponent(symbol.toUpperCase())}`
  );
  return handleResponse(response);
};

/**
 * Add an asset to the watchlist
 * @param {string} symbol - e.g. "AAPL", "BTCUSD"
 * @param {string} type   - e.g. "STOCK", "CRYPTO"
 * @returns {Promise<Object>} Response from server (e.g. updated watchlist or success message)
 */
export const addToWatchlist = async (symbol, type) => {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    type: type.toUpperCase(),
  });

  const response = await fetch(`${API_BASE_URL}/watchlist/add?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return handleResponse(response);
};

/**
 * Remove an asset from the watchlist by symbol
 * @param {string} symbol - e.g. "AAPL"
 * @returns {Promise<boolean|Object>} true on success (204), or parsed response
 */
export const removeFromWatchlist = async (symbol) => {
  const response = await fetch(`${API_BASE_URL}/watchlist/remove/${encodeURIComponent(symbol.toUpperCase())}`, {
    method: "DELETE", // or POST if your backend expects POST for removal
    // If backend expects POST instead of DELETE, change to:
    // method: "POST",
    // headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return handleResponse(response); // returns true for 204
};

/**
 * Get watchlist sector catalog
 * @returns {Promise<Array>} Array of sector names
 */
export const getSectorCatalog = async () => {
  const response = await fetch(`${API_BASE_URL}/watchlist/sectors/catalog`);
  return handleResponse(response);
};

/**
 * Get user-selected watchlist sectors
 * @returns {Promise<Array>} Array of watchlist sectors
 */
export const getWatchlistSectors = async () => {
  const response = await fetch(`${API_BASE_URL}/watchlist/sectors`);
  return handleResponse(response);
};

/**
 * Add a sector to the watchlist
 * @param {string} name - e.g. "Technology"
 */
export const addWatchlistSector = async (name) => {
  const params = new URLSearchParams({ name });
  const response = await fetch(`${API_BASE_URL}/watchlist/sectors/add?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return handleResponse(response);
};

/**
 * Remove a sector from the watchlist
 * @param {string} name - e.g. "Technology"
 */
export const removeWatchlistSector = async (name) => {
  const response = await fetch(
    `${API_BASE_URL}/watchlist/sectors/remove/${encodeURIComponent(name)}`,
    { method: "DELETE" }
  );
  return handleResponse(response);
};
