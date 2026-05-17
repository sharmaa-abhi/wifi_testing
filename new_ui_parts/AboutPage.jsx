const AboutPage = ({ onBack }) => (
  <section className="info-page">
    <div className="info-page-header">
      <div>
        <p className="provider-label">Company</p>
        <h2>About</h2>
      </div>
      <button type="button" className="nav-link" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
    <div className="info-grid">
      <article className="diagnostic-card">
        <h3>Mission</h3>
        <p>Make internet quality testing simple, reliable, and transparent.</p>
      </article>
      <article className="diagnostic-card">
        <h3>Focus</h3>
        <p>Wi‑Fi diagnostics, real-time latency checks, and practical optimization.</p>
      </article>
      <article className="diagnostic-card">
        <h3>Version</h3>
        <p>WiFi Test Dashboard v1.0</p>
      </article>
    </div>
  </section>
);

export default AboutPage;
