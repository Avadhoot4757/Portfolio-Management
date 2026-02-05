import React from "react";
import AnimatedCard from "./AnimatedCard";

const SettingsPage = () => {
  return (
    <section id="settings" className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Settings</h2>
          <p className="section-subtitle">
            Manage preferences, alerts, and account details.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <AnimatedCard className="card" delay={0.05}>
          <div className="card-header">
            <h3>Notifications</h3>
          </div>
          <div className="settings-list">
            <label className="settings-item">
              <span>Price Alerts</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="settings-item">
              <span>Weekly Summary</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="settings-item">
              <span>Market News</span>
              <input type="checkbox" />
            </label>
          </div>
        </AnimatedCard>

        <AnimatedCard className="card" delay={0.1}>
          <div className="card-header">
            <h3>Preferences</h3>
          </div>
          <div className="settings-list">
            <label className="settings-item">
              <span>Currency</span>
              <select defaultValue="USD">
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
            <label className="settings-item">
              <span>Risk Profile</span>
              <select defaultValue="moderate">
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </label>
          </div>
        </AnimatedCard>
      </div>
    </section>
  );
};

export default SettingsPage;
