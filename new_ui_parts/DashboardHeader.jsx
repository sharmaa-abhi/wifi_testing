import { FiSettings } from "react-icons/fi";

const DashboardHeader = ({ onToggleSettings }) => (
  <header className="topbar">
    <div className="brand">
      <span className="brand-mark" />
      <span className="brand-text">SPEEDTEST</span>
    </div>
    <nav className="topnav">
      <button type="button" className="nav-link">Apps</button>
      <button type="button" className="nav-link">Learn</button>
      <button type="button" className="nav-link">Data</button>
      <button type="button" className="nav-link">About</button>
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
