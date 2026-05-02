export default function Chip({ active, onClick, children, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 10px",
        borderRadius: 6,
        border: active
          ? `1px solid ${color || "#6366f1"}55`
          : "1px solid #ffffff10",
        background: active ? (color ? `${color}18` : "#6366f118") : "#ffffff07",
        color: active ? (color || "#a5b4fc") : "#6b7280",
        cursor: "pointer",
        transition: "all 0.12s",
        userSelect: "none",
      }}
    >
      {children}
    </button>
  );
}
