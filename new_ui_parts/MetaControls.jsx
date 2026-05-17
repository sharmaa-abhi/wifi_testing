const MetaControls = ({ lastTested, onToggleSettings }) => (
  <section className="meta-row">
    <div className="meta-left">
      <span className="meta-pill">Results</span>
      <button
        type="button"
        className="meta-pill meta-pill-button"
        onClick={onToggleSettings}
      >
        Settings
      </button>
    </div>
    <div className="meta-right">
      <span className="meta-label">Last test</span>
      <span className="meta-value">{lastTested || "--"}</span>
    </div>
  </section>
);

export default MetaControls;
