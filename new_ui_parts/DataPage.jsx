const DataPage = ({ history, onBack }) => (
  <section className="info-page">
    <div className="info-page-header">
      <div>
        <p className="provider-label">Analytics</p>
        <h2>Data</h2>
      </div>
      <button type="button" className="nav-link" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
    <div className="info-grid">
      <article className="diagnostic-card">
        <h3>Total Tests</h3>
        <p><strong>{history.length}</strong> records saved</p>
      </article>
      <article className="diagnostic-card">
        <h3>Best Download</h3>
        <p>
          <strong>{history.length ? Math.round(Math.max(...history.map((item) => item.download || 0))) : 0} Mbps</strong>
        </p>
      </article>
      <article className="diagnostic-card">
        <h3>Average Download</h3>
        <p>
          <strong>
            {history.length
              ? Math.round(history.reduce((acc, item) => acc + (item.download || 0), 0) / history.length)
              : 0} Mbps
          </strong>
        </p>
      </article>
    </div>
  </section>
);

export default DataPage;
