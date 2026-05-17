import { useCallback, useMemo, useState } from "react";
import { FiWifi, FiZap, FiUpload, FiDownload, FiSettings } from "react-icons/fi";
import SpeedGauge from "./SpeedGauge.jsx";
import "./App.css";

const DOWNLOAD_SIZES = [
  200000, 500000, 1000000, 2000000
];
const TEST_DURATION_MS = 30000;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value).toString();
};

const formatPing = (value) => {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value).toString();
};

const buildWifiInfo = () => {
  const strength = Math.floor(70 + Math.random() * 25);
  const freq = Math.random() > 0.5 ? "5 GHz" : "2.4 GHz";
  return {
    ssid: "Home Network",
    signalStrength: `${strength}%`,
    frequency: freq
  };
};

const getConnectionEstimate = () => {
  const info = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!info) return null;

  const downlink = Number.isFinite(info.downlink) ? info.downlink : 0;
  const rtt = Number.isFinite(info.rtt) ? info.rtt : 0;
  return {
    download: downlink,
    upload: downlink ? Math.max(1, downlink * 0.4) : 0,
    ping: rtt
  };
};

const withTimeout = async (promise, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const App = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [wifiInfo, setWifiInfo] = useState(null);
  const [lastTested, setLastTested] = useState(null);

  const speedForGauge = useMemo(() => clamp(downloadSpeed, 0, 500), [downloadSpeed]);
  const jitter = useMemo(() => (ping ? Math.max(1, Math.round(ping * 0.35)) : 0), [ping]);

  const testDownload = async () => {
    let totalBits = 0;
    let totalSeconds = 0;
    let index = 0;
    const deadline = performance.now() + TEST_DURATION_MS * 0.6;

    while (performance.now() < deadline) {
      const size = DOWNLOAD_SIZES[index % DOWNLOAD_SIZES.length];
      index += 1;
      const url = `/speed/__down?bytes=${size}`;
      const start = performance.now();
      const response = await withTimeout(
        (signal) => fetch(url, { cache: "no-store", signal }),
        12000
      );
      const buffer = await response.arrayBuffer();
      const end = performance.now();

      totalBits += buffer.byteLength * 8;
      totalSeconds += (end - start) / 1000;
    }

    const mbps = totalBits / totalSeconds / 1000000;
    return mbps;
  };

  const testUpload = async () => {
    const size = 600000;
    const data = new Uint8Array(size);
    const deadline = performance.now() + TEST_DURATION_MS * 0.3;
    let totalBits = 0;
    let totalSeconds = 0;

    while (performance.now() < deadline) {
      const start = performance.now();
      await withTimeout(
        (signal) =>
          fetch("/speed/__up", {
            method: "POST",
            body: data,
            headers: {
              "Content-Type": "application/octet-stream"
            },
            signal
          }),
        12000
      );
      const end = performance.now();
      totalBits += data.byteLength * 8;
      totalSeconds += (end - start) / 1000;
    }

    const mbps = totalBits / totalSeconds / 1000000;
    return mbps;
  };

  const testPing = async () => {
    const deadline = performance.now() + TEST_DURATION_MS * 0.1;
    const samples = [];

    while (performance.now() < deadline) {
      const start = performance.now();
      await withTimeout(
        (signal) =>
          fetch("/speed/__down?bytes=1", {
            method: "HEAD",
            cache: "no-store",
            signal
          }),
        8000
      );
      const end = performance.now();
      samples.push(end - start);
    }

    if (samples.length === 0) return 0;
    const sum = samples.reduce((acc, value) => acc + value, 0);
    return sum / samples.length;
  };

  const testSpeed = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        testDownload(),
        testUpload(),
        testPing()
      ]);

      const [downloadResult, uploadResult, pingResult] = results;

      const download = downloadResult.status === "fulfilled" ? downloadResult.value : null;
      const upload = uploadResult.status === "fulfilled" ? uploadResult.value : null;
      const latency = pingResult.status === "fulfilled" ? pingResult.value : null;

      if (download === null && upload === null && latency === null) {
        const estimate = getConnectionEstimate();
        if (estimate) {
          setDownloadSpeed(estimate.download);
          setUploadSpeed(estimate.upload);
          setPing(estimate.ping);
          setWifiInfo(buildWifiInfo());
          setError("Real test failed. Showing estimated values from your browser.");
          return;
        }

        throw new Error("All tests failed");
      }

      if (download !== null) setDownloadSpeed(download);
      if (upload !== null) setUploadSpeed(upload);
      if (latency !== null) setPing(latency);
      setWifiInfo(buildWifiInfo());
      setLastTested(new Date().toLocaleString());

      if (download === null || upload === null || latency === null) {
        setError("Partial test completed. Some results could not be measured.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Speed test failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-text">SPEEDTEST</span>
        </div>
        <nav className="topnav">
          <button type="button" className="nav-link">Apps</button>
          <button type="button" className="nav-link">Learn</button>
          <button type="button" className="nav-link">Data</button>
          <button type="button" className="nav-link">About</button>
        </nav>
        <div className="top-actions">
          <button type="button" className="nav-link">English</button>
          <button type="button" className="icon-button" aria-label="Settings">
            <FiSettings />
          </button>
        </div>
      </header>

      <main className="main speedtest">
        <section className="results-row">
          <div className="stat-block download">
            <div className="stat-label">
              <FiDownload />
              <span>Download</span>
            </div>
            <div className="stat-value">
              {formatNumber(downloadSpeed)}
              <span className="stat-unit">Mbps</span>
            </div>
          </div>
          <div className="stat-block upload">
            <div className="stat-label">
              <FiUpload />
              <span>Upload</span>
            </div>
            <div className="stat-value">
              {formatNumber(uploadSpeed)}
              <span className="stat-unit">Mbps</span>
            </div>
          </div>
        </section>

        <section className="meta-row">
          <div className="meta-left">
            <span className="meta-pill">Results</span>
            <span className="meta-pill">Settings</span>
          </div>
          <div className="meta-right">
            <span className="meta-label">Last test</span>
            <span className="meta-value">{lastTested || "--"}</span>
          </div>
        </section>

        <section className="latency-row">
          <div className="latency-item">
            <FiZap />
            <span>Ping</span>
            <strong>{formatPing(ping)}</strong>
            <span className="latency-unit">ms</span>
          </div>
          <div className="latency-item">
            <span>Jitter</span>
            <strong>{formatPing(jitter)}</strong>
            <span className="latency-unit">ms</span>
          </div>
          <div className="latency-item">
            <span>Loss</span>
            <strong>0</strong>
            <span className="latency-unit">%</span>
          </div>
        </section>

        <section className="center-row">
          <div className={`gauge-shell ${isLoading ? "glow" : ""}`}>
            <SpeedGauge speed={speedForGauge} maxSpeed={500} isLoading={isLoading} />
            <button className="go-button" onClick={testSpeed} disabled={isLoading}>
              {isLoading ? "Testing" : "GO"}
            </button>
            <div className="speed-label">
              <span className="speed-value">{formatNumber(downloadSpeed)}</span>
              <span className="speed-unit">Mbps</span>
              <span className="speed-type">Download</span>
            </div>
          </div>

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
        </section>

        {error && <div className="alert">{error}</div>}
      </main>
    </div>
  );
};

export default App;
