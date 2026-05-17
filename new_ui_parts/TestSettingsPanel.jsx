const TestSettingsPanel = ({ settings, setSettings, updateNumericSetting }) => (
  <section className="settings-panel">
    <h3>Test Settings</h3>
    <div className="settings-grid">
      <label>
        Duration (sec)
        <input
          type="number"
          min={10}
          max={120}
          value={settings.testDurationSec}
          onChange={(event) =>
            updateNumericSetting("testDurationSec", event.target.value, 10, 120)
          }
        />
      </label>
      <label>
        Gauge max (Mbps)
        <input
          type="number"
          min={100}
          max={2000}
          value={settings.maxGaugeSpeed}
          onChange={(event) =>
            updateNumericSetting("maxGaugeSpeed", event.target.value, 100, 2000)
          }
        />
      </label>
      <label>
        History limit
        <input
          type="number"
          min={5}
          max={100}
          value={settings.historyLimit}
          onChange={(event) =>
            updateNumericSetting("historyLimit", event.target.value, 5, 100)
          }
        />
      </label>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={settings.autoSaveHistory}
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, autoSaveHistory: event.target.checked }))
          }
        />
        Auto-save test history
      </label>
    </div>
  </section>
);

export default TestSettingsPanel;
