import { FiSettings } from "react-icons/fi";

const DashboardHeader = ({ onToggleSettings, onNavigate, activeView }) => (
  <header className="topbar">
    <div className="brand">
      <span className="brand-mark" />
      <span className="brand-text">SPEEDTEST</span>
    </div>
    <nav className="topnav">
      <button
        type="button"
        className={`nav-link ${activeView === "apps" ? "active" : ""}`}
        onClick={() => onNavigate("apps")}
      >
        Apps
      </button>
      <button
        type="button"
        className={`nav-link ${activeView === "learn" ? "active" : ""}`}
        onClick={() => onNavigate("learn")}
      >
        Learn
      </button>
      <button
        type="button"
        className={`nav-link ${activeView === "data" ? "active" : ""}`}
        onClick={() => onNavigate("data")}
      >
        Data
      </button>
      <button
        type="button"
        className={`nav-link ${activeView === "about" ? "active" : ""}`}
        onClick={() => onNavigate("about")}
      >
        About
      </button>
    </nav>
    <div className="top-actions">
      <button type="button" className="nav-link">English</button>
      <button
        type="button"
        className="icon-button"
        aria-label="Settings"
        onClick={onToggleSettings}
      >
        <FiSettings />
      </button>
    </div>
  </header>
);

export default DashboardHeader;
