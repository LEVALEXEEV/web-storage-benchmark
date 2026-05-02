import { getStorageStyle } from "../../constants";

export default function StorageDot({ label }) {
  const s = getStorageStyle(label);
  if (!s) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 500,
        color: s.color,
        background: s.dim,
        border: `1px solid ${s.color}44`,
        borderRadius: 4,
        padding: "2px 7px",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
