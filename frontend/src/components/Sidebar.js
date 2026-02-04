import React from "react";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">PM</div>
      <nav className="sidebar-nav">
        <a className="nav-item active" href="#dashboard" aria-label="Dashboard">
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
          <span className="tooltip">Dashboard</span>
        </a>
        <a className="nav-item" href="#holdings" aria-label="Holdings">
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h16v4H4V4zm0 6h16v10H4V10zm4 3v4h8v-4H8z" />
          </svg>
          <span className="tooltip">Holdings</span>
        </a>
        <a className="nav-item" href="#performance" aria-label="Performance">
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19h16v2H4v-2zm2-2h3V7H6v10zm5 0h3V3h-3v14zm5 0h3v-6h-3v6z" />
          </svg>
          <span className="tooltip">Performance</span>
        </a>
        <a className="nav-item" href="#settings" aria-label="Settings">
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.7 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.05.3-.07.62-.07.94 0 .31.02.63.06.94l-2.02 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.39.32.6.22l2.39-.96c.5.41 1.05.74 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.22 1.12-.52 1.63-.94l2.39.96c.22.1.48.01.6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.02-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z" />
          </svg>
          <span className="tooltip">Settings</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
