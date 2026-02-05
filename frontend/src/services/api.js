// src/services/api.js
const API_BASE_URL = "http://localhost:8080/portfolio"; // ← change to your actual backend URL

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(errorText || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const getAllAssets = async () => {
  const response = await fetch(`${API_BASE_URL}`);

  // Clone BEFORE body is read
  const clone = response.clone();
  clone.json().then(data => console.log("API Response:", data));

  return handleResponse(response);
};

export const getPortfolioPerformance = async () => {
  const response = await fetch(`${API_BASE_URL}/value`);
  return handleResponse(response);
};

export const getPortfolioValue = async () => {
  // We'll reuse getPortfolioPerformance since it already contains currentValue
  const perf = await getPortfolioPerformance();
  return perf.currentValue;
};

export const buyAsset = async ({ symbol, type, quantity, purchaseDate }) => {
  // purchaseDate is not used in your current backend → ignored for now
  let buyTimeValue
  if (purchaseDate) {
    // Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ss (use midnight or current time)
    buyTimeValue = `${purchaseDate}T00:00:00`;   // midnight
    // OR: buyTimeValue = new Date(purchaseDate).toISOString(); // full current time
  }
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    type,
    quantity: quantity.toString(),
    buyTime: buyTimeValue,
  });

  const response = await fetch(`${API_BASE_URL}/add?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return handleResponse(response);
};

export const sellAsset = async ({ symbol, quantity }) => {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    quantity: quantity.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/remove?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return handleResponse(response);
};