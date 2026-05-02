export default function Sidebar({ tabs, activeTab, setActiveTab, setShowMethodology }) {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "#0d1117",
        borderRight: "1px solid #1a1f2e",
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        gap: 4,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ padding: "0 8px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            WS
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "-0.02em",
              }}
            >
              WebStorage
            </div>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.02em" }}>
              Benchmark
            </div>
          </div>
        </div>
      </div>

      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-item${activeTab === tab.id ? " active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 10px",
            borderRadius: 8,
            border: "1px solid transparent",
            background: "transparent",
            color: activeTab === tab.id ? "#a5b4fc" : "#6b7280",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.1s",
            fontSize: 12,
            fontWeight: activeTab === tab.id ? 600 : 400,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: activeTab === tab.id ? "#4f46e520" : "#ffffff08",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: activeTab === tab.id ? "#a5b4fc" : "#4b5563",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <div style={{ lineHeight: 1.2 }}>{tab.label}</div>
            <div
              style={{
                fontSize: 10,
                color: "#374151",
                fontWeight: 400,
                marginTop: 1,
              }}
            >
              {tab.description}
            </div>
          </div>
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <button
        type="button"
        onClick={() => setShowMethodology(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #1f2937",
          background: "transparent",
          color: "#4b5563",
          cursor: "pointer",
          fontSize: 11,
          transition: "all 0.1s",
        }}
      >
        <span style={{ fontSize: 11 }}>?</span>
        Методология
      </button>

      <div style={{ padding: "12px 8px 0", borderTop: "1px solid #111827", marginTop: 8 }}>
        <a
          style={{
            display: "inline-block",
            fontSize: 10,
            color: "#374151",
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 4,
            padding: "3px 8px",
          }}
          href="https://github.com/LEVALEXEEV/web-storage-benchmark"
          target="_blank"
          rel="noreferrer"
        >
          Frontend only GitHub
        </a>
      </div>
    </aside>
  );
}
