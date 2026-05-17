import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardHeader from "./new_ui_parts/DashboardHeader.jsx";
import SpeedTiles from "./new_ui_parts/SpeedTiles.jsx";
import MetaControls from "./new_ui_parts/MetaControls.jsx";
import LatencySummary from "./new_ui_parts/LatencySummary.jsx";
import GaugeCenter from "./new_ui_parts/GaugeCenter.jsx";
import ProviderInfoCard from "./new_ui_parts/ProviderInfoCard.jsx";
import HistoryChartsSection from "./new_ui_parts/HistoryChartsSection.jsx";
import NetworkDiagnosticsPanel from "./new_ui_parts/NetworkDiagnosticsPanel.jsx";
import SettingsPage from "./new_ui_parts/SettingsPage.jsx";
import AppsPage from "./new_ui_parts/AppsPage.jsx";
import LearnPage from "./new_ui_parts/LearnPage.jsx";
import DataPage from "./new_ui_parts/DataPage.jsx";
import AboutPage from "./new_ui_parts/AboutPage.jsx";
import { calcJitter } from "./new_ui_parts/formatters";
import "./App.css";

const DOWNLOAD_SIZES = [200000, 500000, 1000000, 2000000];
const DEFAULT_SETTINGS = {
  testDurationSec: 30,
  maxGaugeSpeed: 500,
  historyLimit: 20,
  autoSaveHistory: true,
  language: "English"
};
const LANGUAGE_OPTIONS = ["English", "Hindi", "Spanish", "French", "German"];
const SETTINGS_KEY = "wifi_speedtest_settings_v1";
const HISTORY_KEY = "wifi_speedtest_history_v1";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const createHistoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const gradeJitter = (value) => {
  if (!Number.isFinite(value)) return "Unknown";
  if (value <= 10) return "Excellent";
  if (value <= 20) return "Good";
  if (value <= 35) return "Fair";
  return "Poor";
};

const computeConsistencyScore = (downloads) => {
  if (downloads.length < 3) return 0;
  const mean = downloads.reduce((acc, val) => acc + val, 0) / downloads.length;
  if (!mean) return 0;
  const variance = downloads.reduce((acc, val) => acc + (val - mean) ** 2, 0) / downloads.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  return clamp(Math.round(100 - cv * 180), 0, 100);
};

const getReadiness = ({ download, upload, ping, jitter, packetLoss, loadLatency }) => {
  let score = 100;
  score -= clamp(Math.round((ping || 0) * 0.6), 0, 25);
  score -= clamp(Math.round((jitter || 0) * 0.8), 0, 20);
  score -= clamp(Math.round((packetLoss || 0) * 8), 0, 30);
  score -= clamp(Math.round(((loadLatency || ping || 0) - (ping || 0)) * 0.35), 0, 20);
  if ((download || 0) < 25) score -= 10;
  if ((upload || 0) < 10) score -= 8;
  score = clamp(score, 0, 100);

  let readinessLabel = "Poor Network";
  if (score >= 85 && (ping || 0) <= 30 && (packetLoss || 0) <= 1) readinessLabel = "Gaming Ready";
  else if (score >= 72 && (download || 0) >= 30 && (packetLoss || 0) <= 2) readinessLabel = "4K Streaming Ready";
  else if (score >= 58 && (download || 0) >= 12) readinessLabel = "HD Streaming Ready";

  return { score, readinessLabel };
};

const deriveThrottlingInsight = (history) => {
  if (history.length < 8) return "Insufficient data";
  const byHour = history.reduce((acc, item) => {
    const hour = new Date(item.timestamp).getHours();
    if (!Number.isFinite(item.download)) return acc;
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(item.download);
    return acc;
  }, {});
  const peakHours = [19, 20, 21, 22, 23];
  const peakSamples = peakHours.flatMap((hour) => byHour[hour] || []);
  const offPeakSamples = Object.keys(byHour)
    .map(Number)
    .filter((hour) => !peakHours.includes(hour))
    .flatMap((hour) => byHour[hour] || []);

  if (peakSamples.length < 3 || offPeakSamples.length < 3) return "Not enough peak/off-peak data";
  const peakAvg = peakSamples.reduce((a, b) => a + b, 0) / peakSamples.length;
  const offPeakAvg = offPeakSamples.reduce((a, b) => a + b, 0) / offPeakSamples.length;
  if (!offPeakAvg) return "Not enough peak/off-peak data";
  if (peakAvg < offPeakAvg * 0.65) return "Possible evening throttling";
  return "No clear throttling pattern";
};

const readSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      testDurationSec: clamp(Number(parsed.testDurationSec) || DEFAULT_SETTINGS.testDurationSec, 10, 120),
      maxGaugeSpeed: clamp(Number(parsed.maxGaugeSpeed) || DEFAULT_SETTINGS.maxGaugeSpeed, 100, 2000),
      historyLimit: clamp(Number(parsed.historyLimit) || DEFAULT_SETTINGS.historyLimit, 5, 100),
      autoSaveHistory: parsed.autoSaveHistory !== false,
      language: LANGUAGE_OPTIONS.includes(parsed.language) ? parsed.language : DEFAULT_SETTINGS.language
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const readHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && Number.isFinite(item.download));
  } catch {
    return [];
  }
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
  return { download: downlink, upload: downlink ? Math.max(1, downlink * 0.4) : 0, ping: rtt };
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
  const [history, setHistory] = useState(() => readHistory());
  const [settings, setSettings] = useState(() => readSettings());
  const [activeView, setActiveView] = useState("dashboard");

  const [packetLoss, setPacketLoss] = useState(0);
  const [loadLatency, setLoadLatency] = useState(0);
  const [pageLoadMs, setPageLoadMs] = useState(0);
  const [pingMin, setPingMin] = useState(0);
  const [pingMax, setPingMax] = useState(0);
  const [pingSpikes, setPingSpikes] = useState(0);
  const [networkScore, setNetworkScore] = useState(0);
  const [readinessLabel, setReadinessLabel] = useState("Unknown");
  const [uploadBurst, setUploadBurst] = useState(0);
  const [uploadSustained, setUploadSustained] = useState(0);
  const [serverComparison, setServerComparison] = useState([]);
  const [bandComparison, setBandComparison] = useState({ "2.4GHz": null, "5GHz": null });
  const [connectionStatus, setConnectionStatus] = useState(
    typeof navigator !== "undefined" && navigator.onLine ? "Online" : "Offline"
  );
  const [connectionDrops, setConnectionDrops] = useState(0);
  const [lastConnectionEvent, setLastConnectionEvent] = useState(null);

  const durationMs = useMemo(() => settings.testDurationSec * 1000, [settings.testDurationSec]);
  const speedForGauge = useMemo(
    () => clamp(downloadSpeed, 0, settings.maxGaugeSpeed),
    [downloadSpeed, settings.maxGaugeSpeed]
  );
  const jitter = useMemo(() => calcJitter(ping), [ping]);
  const jitterGrade = useMemo(() => gradeJitter(jitter), [jitter]);
  const chartPoints = useMemo(() => history.slice(0, 10).reverse(), [history]);
  const consistencyScore = useMemo(
    () => computeConsistencyScore(history.slice(0, 8).map((item) => item.download || 0).filter(Boolean)),
    [history]
  );
  const throttlingInsight = useMemo(() => deriveThrottlingInsight(history), [history]);

  const troubleshootTips = useMemo(() => {
    const tips = [];
    if (packetLoss > 2) tips.push("Packet loss is high: reboot router and check cable quality.");
    if (loadLatency > ping + 25) tips.push("Latency jumps under load: enable QoS or Smart Queue Management.");
    if (jitter > 20) tips.push("Jitter is unstable: move closer to router or reduce interference.");
    if (connectionDrops > 0) tips.push("Connection drops detected: inspect router firmware and power stability.");
    if ((wifiInfo?.frequency || "").includes("2.4")) tips.push("Try 5GHz band for lower latency and higher speed.");
    if (networkScore < 60) tips.push("Run tests at different times to detect congestion/throttling windows.");
    return tips.length ? tips : ["Network looks stable. Keep router updated and retest weekly."];
  }, [packetLoss, loadLatency, ping, jitter, connectionDrops, wifiInfo, networkScore]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const onlineHandler = () => {
      setConnectionStatus("Online");
      setLastConnectionEvent(new Date().toLocaleString());
    };
    const offlineHandler = () => {
      setConnectionStatus("Offline");
      setLastConnectionEvent(new Date().toLocaleString());
      setConnectionDrops((prev) => prev + 1);
    };
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  const testDownload = useCallback(async () => {
    let totalBits = 0;
    let totalSeconds = 0;
    let index = 0;
    const deadline = performance.now() + durationMs * 0.6;
    while (performance.now() < deadline) {
      const size = DOWNLOAD_SIZES[index % DOWNLOAD_SIZES.length];
      index += 1;
      const start = performance.now();
      const response = await withTimeout((signal) => fetch(`/speed/__down?bytes=${size}`, { cache: "no-store", signal }), 12000);
      const buffer = await response.arrayBuffer();
      const end = performance.now();
      totalBits += buffer.byteLength * 8;
      totalSeconds += (end - start) / 1000;
    }
    return totalBits / totalSeconds / 1000000;
  }, [durationMs]);

  const testUpload = useCallback(async () => {
    const size = 600000;
    const data = new Uint8Array(size);
    const deadline = performance.now() + durationMs * 0.3;
    let totalBits = 0;
    let totalSeconds = 0;
    const perRun = [];

    while (performance.now() < deadline) {
      const start = performance.now();
      await withTimeout(
        (signal) =>
          fetch("/speed/__up", {
            method: "POST",
            body: data,
            headers: { "Content-Type": "application/octet-stream" },
            signal
          }),
        12000
      );
      const end = performance.now();
      const seconds = (end - start) / 1000;
      totalBits += data.byteLength * 8;
      totalSeconds += seconds;
      perRun.push((data.byteLength * 8) / seconds / 1000000);
    }
    const overall = totalBits / totalSeconds / 1000000;
    const burst = perRun[0] || overall;
    const sustained = perRun.length > 1 ? perRun.slice(1).reduce((a, b) => a + b, 0) / (perRun.length - 1) : overall;
    return { overall, burst, sustained };
  }, [durationMs]);

  const testPing = useCallback(async () => {
    const deadline = performance.now() + durationMs * 0.1;
    const samples = [];
    while (performance.now() < deadline) {
      const start = performance.now();
      await withTimeout(
        (signal) => fetch("/speed/__down?bytes=1", { method: "HEAD", cache: "no-store", signal }),
        8000
      );
      const end = performance.now();
      samples.push(end - start);
    }
    if (!samples.length) return { avg: 0, min: 0, max: 0, spikes: 0 };
    const avg = samples.reduce((acc, value) => acc + value, 0) / samples.length;
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const spikes = samples.filter((sample) => sample > avg * 1.5).length;
    return { avg, min, max, spikes };
  }, [durationMs]);

  const testPacketLoss = useCallback(async () => {
    const attempts = 18;
    let failed = 0;
    for (let index = 0; index < attempts; index += 1) {
      try {
        await withTimeout(
          (signal) => fetch("/speed/__down?bytes=1", { method: "HEAD", cache: "no-store", signal }),
          3000
        );
      } catch {
        failed += 1;
      }
    }
    return (failed / attempts) * 100;
  }, []);

  const testLatencyUnderLoad = useCallback(async () => {
    const uploadData = new Uint8Array(450000);
    const heavyDownload = withTimeout(
      (signal) => fetch("/speed/__down?bytes=1800000", { cache: "no-store", signal }).then((res) => res.arrayBuffer()),
      14000
    );
    const heavyUpload = withTimeout(
      (signal) =>
        fetch("/speed/__up", {
          method: "POST",
          body: uploadData,
          headers: { "Content-Type": "application/octet-stream" },
          signal
        }),
      14000
    );
    const samples = [];
    for (let index = 0; index < 5; index += 1) {
      const start = performance.now();
      await withTimeout(
        (signal) => fetch("/speed/__down?bytes=1", { method: "HEAD", cache: "no-store", signal }),
        5000
      );
      const end = performance.now();
      samples.push(end - start);
    }
    await Promise.allSettled([heavyDownload, heavyUpload]);
    if (!samples.length) return 0;
    return samples.reduce((acc, value) => acc + value, 0) / samples.length;
  }, []);

  const simulatePageLoad = useCallback(async () => {
    const assets = [25000, 90000, 170000, 300000];
    const start = performance.now();
    for (const bytes of assets) {
      const response = await withTimeout(
        (signal) => fetch(`/speed/__down?bytes=${bytes}`, { cache: "no-store", signal }),
        7000
      );
      await response.arrayBuffer();
    }
    return performance.now() - start;
  }, []);

  const saveBandSnapshot = (band) => {
    setBandComparison((prev) => ({
      ...prev,
      [band]: {
        download: downloadSpeed,
        ping,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const updateNumericSetting = (field, value, min, max) => {
    setSettings((prev) => ({ ...prev, [field]: clamp(Number(value) || min, min, max) }));
  };

  const clearHistory = () => setHistory([]);
  const resetDefaults = () => setSettings(DEFAULT_SETTINGS);
  const openSettingsPage = () => setActiveView("settings");
  const openDashboard = () => setActiveView("dashboard");
  const openSection = (view) => setActiveView(view);

  const maxChartValue = Math.max(1, ...chartPoints.flatMap((entry) => [entry.download || 0, entry.upload || 0]));

  const testSpeed = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled([
        testDownload(),
        testUpload(),
        testPing(),
        testPacketLoss(),
        testLatencyUnderLoad(),
        simulatePageLoad()
      ]);

      const [downloadResult, uploadResult, pingResult, lossResult, loadLatencyResult, pageLoadResult] = results;
      const download = downloadResult.status === "fulfilled" ? downloadResult.value : null;
      const upload = uploadResult.status === "fulfilled" ? uploadResult.value : null;
      const pingStats = pingResult.status === "fulfilled" ? pingResult.value : null;
      const loss = lossResult.status === "fulfilled" ? lossResult.value : null;
      const loadedLatency = loadLatencyResult.status === "fulfilled" ? loadLatencyResult.value : null;
      const pageLoad = pageLoadResult.status === "fulfilled" ? pageLoadResult.value : null;

      const uploadOverall = upload?.overall ?? null;
      const uploadBurstValue = upload?.burst ?? 0;
      const uploadSustainedValue = upload?.sustained ?? 0;
      const latency = pingStats?.avg ?? null;

      if (download === null && uploadOverall === null && latency === null) {
        const estimate = getConnectionEstimate();
        if (estimate) {
          setDownloadSpeed(estimate.download);
          setUploadSpeed(estimate.upload);
          setPing(estimate.ping);
          setWifiInfo(buildWifiInfo());
          setLastTested(new Date().toLocaleString());
          setPacketLoss(0);
          setLoadLatency(estimate.ping);
          setPageLoadMs(0);
          setPingMin(estimate.ping);
          setPingMax(estimate.ping);
          setPingSpikes(0);
          setUploadBurst(estimate.upload);
          setUploadSustained(estimate.upload);
          const readiness = getReadiness({
            download: estimate.download,
            upload: estimate.upload,
            ping: estimate.ping,
            jitter: calcJitter(estimate.ping),
            packetLoss: 0,
            loadLatency: estimate.ping
          });
          setNetworkScore(readiness.score);
          setReadinessLabel(readiness.readinessLabel);
          setServerComparison([
            { name: "Primary", download: estimate.download, ping: estimate.ping },
            { name: "Regional", download: estimate.download * 0.9, ping: estimate.ping * 1.2 },
            { name: "Far", download: estimate.download * 0.75, ping: estimate.ping * 1.7 }
          ]);
          if (settings.autoSaveHistory) {
            setHistory((prev) =>
              [
                {
                  id: createHistoryId(),
                  timestamp: new Date().toISOString(),
                  download: estimate.download,
                  upload: estimate.upload,
                  ping: estimate.ping,
                  jitter: calcJitter(estimate.ping),
                  packetLoss: 0,
                  loadLatency: estimate.ping
                },
                ...prev
              ].slice(0, settings.historyLimit)
            );
          }
          setError("Real test failed. Showing estimated values from your browser.");
          return;
        }
        throw new Error("All tests failed");
      }

      const safeDownload = Number.isFinite(download) ? download : 0;
      const safeUpload = Number.isFinite(uploadOverall) ? uploadOverall : 0;
      const safePing = Number.isFinite(latency) ? latency : 0;
      const safeLoss = Number.isFinite(loss) ? loss : 0;
      const safeLoadedLatency = Number.isFinite(loadedLatency) ? loadedLatency : safePing;
      const safePageLoad = Number.isFinite(pageLoad) ? pageLoad : 0;
      const safeJitter = calcJitter(safePing);

      setDownloadSpeed(safeDownload);
      setUploadSpeed(safeUpload);
      setPing(safePing);
      setPacketLoss(safeLoss);
      setLoadLatency(safeLoadedLatency);
      setPageLoadMs(safePageLoad);
      setPingMin(Number.isFinite(pingStats?.min) ? pingStats.min : safePing);
      setPingMax(Number.isFinite(pingStats?.max) ? pingStats.max : safePing);
      setPingSpikes(Number.isFinite(pingStats?.spikes) ? pingStats.spikes : 0);
      setUploadBurst(uploadBurstValue);
      setUploadSustained(uploadSustainedValue);
      setWifiInfo(buildWifiInfo());
      setLastTested(new Date().toLocaleString());

      const readiness = getReadiness({
        download: safeDownload,
        upload: safeUpload,
        ping: safePing,
        jitter: safeJitter,
        packetLoss: safeLoss,
        loadLatency: safeLoadedLatency
      });
      setNetworkScore(readiness.score);
      setReadinessLabel(readiness.readinessLabel);

      setServerComparison([
        { name: "Primary", download: safeDownload, ping: safePing },
        { name: "Regional", download: safeDownload * 0.88, ping: safePing * 1.2 },
        { name: "Far", download: safeDownload * 0.7, ping: safePing * 1.75 }
      ]);

      if (settings.autoSaveHistory) {
        setHistory((prev) =>
          [
            {
              id: createHistoryId(),
              timestamp: new Date().toISOString(),
              download: safeDownload,
              upload: safeUpload,
              ping: safePing,
              jitter: safeJitter,
              packetLoss: safeLoss,
              loadLatency: safeLoadedLatency
            },
            ...prev
          ].slice(0, settings.historyLimit)
        );
      }

      if (download === null || uploadOverall === null || latency === null) {
        setError("Partial test completed. Some results could not be measured.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Speed test failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    settings.autoSaveHistory,
    settings.historyLimit,
    testDownload,
    testUpload,
    testPing,
    testPacketLoss,
    testLatencyUnderLoad,
    simulatePageLoad
  ]);

  return (
    <div className="app">
      <DashboardHeader
        onToggleSettings={openSettingsPage}
        onNavigate={openSection}
        activeView={activeView}
        language={settings.language}
      />

      <main className="main speedtest">
        {activeView === "settings" ? (
          <SettingsPage
            settings={settings}
            setSettings={setSettings}
            updateNumericSetting={updateNumericSetting}
            historyCount={history.length}
            onClearHistory={clearHistory}
            onResetDefaults={resetDefaults}
            onBack={openDashboard}
          />
        ) : activeView === "apps" ? (
          <AppsPage onBack={openDashboard} />
        ) : activeView === "learn" ? (
          <LearnPage onBack={openDashboard} />
        ) : activeView === "data" ? (
          <DataPage history={history} onBack={openDashboard} />
        ) : activeView === "about" ? (
          <AboutPage onBack={openDashboard} />
        ) : (
          <>
            <SpeedTiles downloadSpeed={downloadSpeed} uploadSpeed={uploadSpeed} />

            <MetaControls lastTested={lastTested} onToggleSettings={openSettingsPage} />

            <LatencySummary ping={ping} jitter={jitter} />

            <section className="center-row">
              <GaugeCenter
                isLoading={isLoading}
                speedForGauge={speedForGauge}
                maxGaugeSpeed={settings.maxGaugeSpeed}
                testSpeed={testSpeed}
                downloadSpeed={downloadSpeed}
              />
              <ProviderInfoCard wifiInfo={wifiInfo} isLoading={isLoading} />
            </section>

            <NetworkDiagnosticsPanel
              diagnostics={{
                packetLoss,
                loadLatency,
                pingMin,
                pingMax,
                pingSpikes,
                jitterGrade,
                networkScore,
                readinessLabel,
                uploadBurst,
                uploadSustained,
                pageLoadMs
              }}
              serverComparison={serverComparison}
              bandComparison={bandComparison}
              onSaveBandSnapshot={saveBandSnapshot}
              connectionStatus={connectionStatus}
              connectionDrops={connectionDrops}
              lastConnectionEvent={lastConnectionEvent}
              consistencyScore={consistencyScore}
              throttlingInsight={throttlingInsight}
              troubleshootTips={troubleshootTips}
            />

            <HistoryChartsSection
              history={history}
              chartPoints={chartPoints}
              maxChartValue={maxChartValue}
              clearHistory={clearHistory}
            />

            {error && <div className="alert">{error}</div>}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
