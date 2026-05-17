const AppsPage = ({ onBack }) => (
  <section className="info-page">
    <div className="info-page-header">
      <div>
        <p className="provider-label">Products</p>
        <h2>Apps</h2>
      </div>
      <button type="button" className="nav-link" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
    <div className="info-grid">
      <article className="diagnostic-card"><h3>Speed Test App</h3><p>Run instant internet diagnostics.</p></article>
      <article className="diagnostic-card"><h3>Network Monitor</h3><p>Track uptime and connection drops.</p></article>
      <article className="diagnostic-card"><h3>Wi‑Fi Optimizer</h3><p>Band and placement recommendations.</p></article>
    </div>
  </section>
);

export default AppsPage;
