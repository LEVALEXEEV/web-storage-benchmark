import { useEffect, useRef, useState } from "react";
import useBenchmark from "./useBenchmark";
import { DEFAULT_JSON_TEMPLATE, TABS } from "./constants";
import { formatDataSize } from "./utils/formatters";
import Sidebar from "./components/Sidebar";
import Toasts from "./components/Toasts";
import MethodologyModal from "./components/MethodologyModal";
import ConfigurePanel from "./components/panels/ConfigurePanel";
import RunPanel from "./components/panels/RunPanel";
import ResultsPanel from "./components/panels/ResultsPanel";

const SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbzjHsqb-bCUUMFQOHZpKnedqxi4GUSz-0dvEB-xpK3dxVpdTMIHz8zBzIqhKNZS7kKQPg/exec";

const getBrowserLabel = () => {
  const ua = navigator.userAgent || "";
  const edge = ua.match(/Edg\/([\d.]+)/);
  if (edge) return `Edge ${edge[1]}`;
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  if (chrome && !ua.includes("Edg/")) return `Chrome ${chrome[1]}`;
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  if (firefox) return `Firefox ${firefox[1]}`;
  const safari = ua.match(/Version\/([\d.]+).*Safari/);
  if (safari) return `Safari ${safari[1]}`;
  return "Unknown";
};

export default function App() {
  const [activeTab, setActiveTab] = useState("configure");
  const [config, setConfig] = useState({
    dataSize: "10 KB",
    dataType: "json",
    jsonTemplate: DEFAULT_JSON_TEMPLATE,
    rawPattern: "random",
    keyCount: "100",
    storageTargets: { localStorage: true, indexedDB: true, cacheAPI: false },
    operations: { write: true, read: true, update: false, delete: false, iterate: false },
  });
  const [toasts, setToasts] = useState([]);
  const [showMethodology, setShowMethodology] = useState(false);
  const hasExportedRef = useRef(false);
  
  const { run, stop, results, progress, status, clearResults, errorLog } = useBenchmark();

  const updateConfig = (key, value) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const addToast = (message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  };

  useEffect(() => {
    if (status === "done") setActiveTab("results");
  }, [status]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bench_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig((c) => ({
          ...c,
          ...parsed,
          storageTargets: { ...c.storageTargets, ...(parsed.storageTargets || {}) },
          operations: { ...c.operations, ...(parsed.operations || {}) },
        }));
      }
    } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("bench_config", JSON.stringify(config)); } catch { }
  }, [config]);

  useEffect(() => {
    if (status === "running") {
      hasExportedRef.current = false;
    }
  }, [status]);

  const buildExportRows = () => {
    const browser = getBrowserLabel();
    const dataType = config.dataType === "json" ? "JSON" : "Raw";
    return results.map((entry) => {
      const duration = Number(entry.duration) || 0;
      const opsSec = duration > 0 ? Math.round(entry.keyCount / (duration / 1000)) : 0;
      return {
        storage: entry.target,
        dataType,
        browser,
        operation: entry.operation,
        keys: entry.keyCount,
        size: formatDataSize(entry.dataSize),
        timeMs: Number(duration.toFixed(2)),
        opsSec,
        status: entry.status || "ok",
      };
    });
  };

  const sendToSheets = async (rows) => {
    if (!SHEETS_WEB_APP_URL) {
      addToast("Google Sheets URL is not set.");
      return false;
    }

    try {
      await fetch(SHEETS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ results: rows }),
      });
      addToast("Результаты отправлены в Google Sheets.");
      return true;
    } catch {
      addToast("Ошибка при отправке в Google Sheets.");
      return false;
    }
  };

  useEffect(() => {
    if (status !== "done" || hasExportedRef.current || results.length === 0) {
      return;
    }

    hasExportedRef.current = true;
    const rows = buildExportRows();
    sendToSheets(rows).then((ok) => {
      if (!ok) {
        hasExportedRef.current = false;
      }
    });
  }, [status, results, config.dataType]);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0c0f",
        color: "#e2e8f0",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', ui-monospace, monospace",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #4f46e533; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        textarea, input { font-family: inherit !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .panel { animation: fadeIn 0.18s ease; }
        .nav-item:hover { background: #ffffff08 !important; }
        .nav-item.active { background: #4f46e515 !important; border-color: #4f46e540 !important; }
        .chip:hover { filter: brightness(1.15); }
        .ghost-btn:hover:not(:disabled) { background: #ffffff0a !important; color: #e2e8f0 !important; }
        .sort-btn:hover { color: #e2e8f0 !important; }
        .tab-btn:hover { background: #ffffff0a !important; }
        .tab-btn.active { background: #1f2937 !important; color: #e2e8f0 !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowMethodology={setShowMethodology}
        />

        <main style={{ flex: 1, padding: "32px 36px", maxWidth: 900, overflow: "auto" }}>
          {activeTab === "configure" && (
            <ConfigurePanel
              config={config}
              updateConfig={updateConfig}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "run" && (
            <RunPanel
              config={config}
              status={status}
              stop={stop}
              run={run}
              results={results}
              progress={progress}
              errorLog={errorLog}
              addToast={addToast}
            />
          )}

          {activeTab === "results" && (
            <ResultsPanel
              results={results}
              clearResults={clearResults}
            />
          )}
        </main>
      </div>

      <Toasts toasts={toasts} />
      {showMethodology && <MethodologyModal onClose={() => setShowMethodology(false)} />}
    </div>
  );
}