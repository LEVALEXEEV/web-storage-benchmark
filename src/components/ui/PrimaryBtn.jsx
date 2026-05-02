export default function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        padding: "7px 16px",
        borderRadius: 7,
        border: "none",
        background: disabled ? "#1f2937" : "#4f46e5",
        color: disabled ? "#374151" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.12s",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </button>
  );
}
