import TestSettingsPanel from "./TestSettingsPanel.jsx";

const SettingsPage = ({
  settings,
  setSettings,
  updateNumericSetting,
  historyCount,
  onClearHistory,
  onResetDefaults,
  onBack
}) => (
  <section className="settings-page">
    <div className="settings-page-header">
      <div>
        <p className="provider-label">Configuration</p>
        <h2>Settings</h2>
      </div>
      <button type="button" className="nav-link" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>

    <TestSettingsPanel
      settings={settings}
      setSettings={setSettings}
      updateNumericSetting={updateNumericSetting}
    />

    <section className="settings-actions">
      <article className="diagnostic-card">
        <h3>History Management</h3>
        <p>Saved test records: <strong>{historyCount}</strong></p>
        <button type="button" className="nav-link" onClick={onClearHistory}>
          Clear Test History
        </button>
      </article>

      <article className="diagnostic-card">
        <h3>Reset</h3>
        <p>Restore default values for all speed test settings.</p>
        <button type="button" className="nav-link" onClick={onResetDefaults}>
          Reset to Defaults
        </button>
      </article>
    </section>
  </section>
);

export default SettingsPage;
