export default function Section({ children, style }) {
  return (
    <div
      style={{
        background: "#111318",
        border: "1px solid #1f2937",
        borderRadius: 10,
        padding: "16px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
