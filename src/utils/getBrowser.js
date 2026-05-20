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

export default getBrowserLabel;