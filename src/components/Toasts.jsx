export default function Toasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 50,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: "#111827",
            border: "1px solid #f59e0b44",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 11,
            color: "#fbbf24",
            boxShadow: "0 4px 24px #00000066",
            maxWidth: 280,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
