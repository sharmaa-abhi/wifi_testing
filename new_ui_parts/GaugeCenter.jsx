import SpeedGauge from "../SpeedGauge.jsx";
import { formatNumber } from "./formatters";

const GaugeCenter = ({ isLoading, speedForGauge, maxGaugeSpeed, testSpeed, downloadSpeed }) => (
  <div className={`gauge-shell ${isLoading ? "glow" : ""}`}>
    <SpeedGauge speed={speedForGauge} maxSpeed={maxGaugeSpeed} isLoading={isLoading} />
    <button className="go-button" onClick={testSpeed} disabled={isLoading}>
      {isLoading ? "Testing" : "GO"}
    </button>
    <div className="speed-label">
      <span className="speed-value">{formatNumber(downloadSpeed)}</span>
      <span className="speed-unit">Mbps</span>
      <span className="speed-type">Download</span>
    </div>
  </div>
);

export default GaugeCenter;
