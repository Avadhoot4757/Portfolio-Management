import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8081",
  timeout: 8000
});

export const getPortfolio = () => apiClient.get("/portfolio");
export const getPortfolioPerformance = () => apiClient.get("/portfolio/performance");
export const getPortfolioValue = () => apiClient.get("/portfolio/value");
export const getMarketPrice = (ticker) => apiClient.get(`/prices/market/${ticker}`);

export const buyAsset = ({ symbol, type, quantity }) =>
  apiClient.post("/portfolio/buy", null, {
    params: { symbol, type, quantity }
  });

export const sellAsset = ({ symbol, quantity }) =>
  apiClient.post("/portfolio/sell", null, {
    params: { symbol, quantity }
  });
