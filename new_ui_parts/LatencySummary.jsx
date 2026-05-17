import { FiZap } from "react-icons/fi";
import { formatPing } from "./formatters";

const LatencySummary = ({ ping, jitter }) => (
  <section className="latency-row">
    <div className="latency-item">
      <FiZap />
      <span>Ping</span>
      <strong>{formatPing(ping)}</strong>
      <span className="latency-unit">ms</span>
    </div>
    <div className="latency-item">
      <span>Jitter</span>
      <strong>{formatPing(jitter)}</strong>
      <span className="latency-unit">ms</span>
    </div>
    <div className="latency-item">
      <span>Loss</span>
      <strong>0</strong>
      <span className="latency-unit">%</span>
    </div>
  </section>
);

export default LatencySummary;
