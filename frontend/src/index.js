import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/variables.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/table.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
