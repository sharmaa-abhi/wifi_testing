import { formatNumber, formatPing } from "./formatters";

const renderMetric = (value, unit = "") => {
  if (!Number.isFinite(value)) return "--";
  return `${Math.round(value)}${unit}`;
};

const NetworkDiagnosticsPanel = ({
  diagnostics,
  serverComparison,
  bandComparison,
  onSaveBandSnapshot,
  connectionStatus,
  connectionDrops,
  lastConnectionEvent,
  consistencyScore,
  throttlingInsight,
  troubleshootTips
}) => (
  <section className="diagnostics-section">
    <div className="diagnostics-grid">
      <article className="diagnostic-card">
        <h3>Wi-Fi Diagnostics</h3>
        <p>Packet loss: <strong>{renderMetric(diagnostics.packetLoss, "%")}</strong></p>
        <p>Latency under load: <strong>{formatPing(diagnostics.loadLatency)} ms</strong></p>
        <p>Ping min/max: <strong>{formatPing(diagnostics.pingMin)}/{formatPing(diagnostics.pingMax)} ms</strong></p>
        <p>Ping spikes: <strong>{formatNumber(diagnostics.pingSpikes)}</strong></p>
        <p>Jitter grade: <strong>{diagnostics.jitterGrade}</strong></p>
      </article>

      <article className="diagnostic-card">
        <h3>Readiness</h3>
        <p>Network score: <strong>{formatNumber(diagnostics.networkScore)}/100</strong></p>
        <p>Status: <strong>{diagnostics.readinessLabel}</strong></p>
        <p>Upload burst/sustain: <strong>{formatNumber(diagnostics.uploadBurst)}/{formatNumber(diagnostics.uploadSustained)} Mbps</strong></p>
        <p>Page load sim: <strong>{formatPing(diagnostics.pageLoadMs)} ms</strong></p>
        <p>Consistency score: <strong>{formatNumber(consistencyScore)}/100</strong></p>
      </article>

      <article className="diagnostic-card">
        <h3>Connection Monitor</h3>
        <p>Status: <strong>{connectionStatus}</strong></p>
        <p>Drops detected: <strong>{formatNumber(connectionDrops)}</strong></p>
        <p>Last event: <strong>{lastConnectionEvent || "--"}</strong></p>
        <p>Throttling indicator: <strong>{throttlingInsight}</strong></p>
      </article>
    </div>

    <div className="diagnostics-grid">
      <article className="diagnostic-card">
        <h3>Server Comparison</h3>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Server</th>
              <th>Down</th>
              <th>Ping</th>
            </tr>
          </thead>
          <tbody>
            {serverComparison.map((server) => (
              <tr key={server.name}>
                <td>{server.name}</td>
                <td>{formatNumber(server.download)} Mbps</td>
                <td>{formatPing(server.ping)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="diagnostic-card">
        <h3>2.4/5 GHz Comparison</h3>
        <div className="band-actions">
          <button type="button" className="nav-link" onClick={() => onSaveBandSnapshot("2.4GHz")}>
            Save 2.4GHz Snapshot
          </button>
          <button type="button" className="nav-link" onClick={() => onSaveBandSnapshot("5GHz")}>
            Save 5GHz Snapshot
          </button>
        </div>
        <table className="mini-table">
          <thead>
            <tr>
              <th>Band</th>
              <th>Down</th>
              <th>Ping</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2.4GHz</td>
              <td>{bandComparison["2.4GHz"] ? `${formatNumber(bandComparison["2.4GHz"].download)} Mbps` : "--"}</td>
              <td>{bandComparison["2.4GHz"] ? `${formatPing(bandComparison["2.4GHz"].ping)} ms` : "--"}</td>
            </tr>
            <tr>
              <td>5GHz</td>
              <td>{bandComparison["5GHz"] ? `${formatNumber(bandComparison["5GHz"].download)} Mbps` : "--"}</td>
              <td>{bandComparison["5GHz"] ? `${formatPing(bandComparison["5GHz"].ping)} ms` : "--"}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article className="diagnostic-card">
        <h3>Troubleshoot Tips</h3>
        <ul className="tips-list">
          {troubleshootTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </article>
    </div>
  </section>
);

export default NetworkDiagnosticsPanel;
