import { FiTrash2 } from "react-icons/fi";
import { formatDateTime, formatNumber, formatPing } from "./formatters";

const HistoryChartsSection = ({ history, chartPoints, maxChartValue, clearHistory }) => (
  <section className="history-section">
    <div className="history-header">
      <h3>Test History</h3>
      <button type="button" className="icon-button" onClick={clearHistory} aria-label="Clear history">
        <FiTrash2 />
      </button>
    </div>

    <div className="charts-grid">
      <div className="chart-card">
        <p>Download (last 10 tests)</p>
        <div className="bar-chart">
          {chartPoints.map((entry) => (
            <div key={`${entry.id}-down`} className="bar-group">
              <span
                className="bar down"
                style={{ height: `${(Math.max(entry.download, 0) / maxChartValue) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="chart-card">
        <p>Upload (last 10 tests)</p>
        <div className="bar-chart">
          {chartPoints.map((entry) => (
            <div key={`${entry.id}-up`} className="bar-group">
              <span
                className="bar up"
                style={{ height: `${(Math.max(entry.upload, 0) / maxChartValue) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="history-table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Download</th>
            <th>Upload</th>
            <th>Ping</th>
            <th>Jitter</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && (
            <tr>
              <td colSpan={5}>No test history yet.</td>
            </tr>
          )}
          {history.slice(0, 8).map((entry) => (
            <tr key={entry.id}>
              <td>{formatDateTime(entry.timestamp)}</td>
              <td>{formatNumber(entry.download)} Mbps</td>
              <td>{formatNumber(entry.upload)} Mbps</td>
              <td>{formatPing(entry.ping)} ms</td>
              <td>{formatPing(entry.jitter)} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default HistoryChartsSection;
