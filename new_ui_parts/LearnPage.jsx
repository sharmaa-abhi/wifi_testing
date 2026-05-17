const LearnPage = ({ onBack }) => (
  <section className="info-page">
    <div className="info-page-header">
      <div>
        <p className="provider-label">Knowledge Base</p>
        <h2>Learn</h2>
      </div>
      <button type="button" className="nav-link" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
    <div className="info-grid">
      <article className="diagnostic-card"><h3>What is Ping?</h3><p>Latency measures response delay between client and server.</p></article>
      <article className="diagnostic-card"><h3>What is Jitter?</h3><p>Jitter is latency fluctuation, critical for calls and gaming.</p></article>
      <article className="diagnostic-card"><h3>2.4GHz vs 5GHz</h3><p>2.4GHz gives range, 5GHz gives higher speed and lower latency.</p></article>
    </div>
  </section>
);

export default LearnPage;
