export default function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#e2e8f0",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {hint && <span style={{ fontSize: 11, color: "#4b5563" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
