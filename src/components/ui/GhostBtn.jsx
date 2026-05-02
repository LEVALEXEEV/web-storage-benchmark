export default function GhostBtn({ onClick, disabled, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ghost-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 14px",
        borderRadius: 7,
        border: `1px solid ${danger ? "#7f1d1d" : "#1f2937"}`,
        background: danger ? "#7f1d1d22" : "transparent",
        color: danger ? "#fca5a5" : "#9ca3af",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  );
}
