const ProviderInfoCard = ({ wifiInfo, isLoading }) => (
  <div className="provider-card">
    <p className="provider-label">Provider</p>
    <h2>{wifiInfo ? wifiInfo.ssid : "Your Network"}</h2>
    <p className="provider-subtitle">Local speed test server</p>
    <div className="provider-meta">
      <div>
        <span className="meta-label">Signal</span>
        <span className="meta-value">{wifiInfo ? wifiInfo.signalStrength : "--"}</span>
      </div>
      <div>
        <span className="meta-label">Frequency</span>
        <span className="meta-value">{wifiInfo ? wifiInfo.frequency : "--"}</span>
      </div>
      <div>
        <span className="meta-label">Status</span>
        <span className="meta-value">{isLoading ? "Testing" : "Ready"}</span>
      </div>
    </div>
  </div>
);

export default ProviderInfoCard;
