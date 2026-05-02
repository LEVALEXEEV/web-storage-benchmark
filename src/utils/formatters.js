export const formatNumber = (v) =>
  String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const formatDataSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
