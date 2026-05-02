export const TABS = [
  { id: "configure", label: "Конфигурация", icon: "⚙", description: "Данные & цели" },
  { id: "run", label: "Run", icon: "▶", description: "Выполнить тест" },
  { id: "results", label: "Results", icon: "◈", description: "Визуализация результатов" },
];

export const DATA_SIZES = ["1 KB", "10 KB", "100 KB", "1 MB", "5 MB"];
export const KEY_COUNTS = ["1", "100", "10000"];
export const STORAGE_TARGETS = [
  { id: "localStorage", label: "LocalStorage" },
  { id: "indexedDB", label: "IndexedDB" },
  { id: "cacheAPI", label: "Cache API" },
];
export const STORAGE_STYLES = {
  localStorage: { label: "LocalStorage", color: "#a78bfa", dim: "#a78bfa22" },
  indexedDB: { label: "IndexedDB", color: "#38bdf8", dim: "#38bdf822" },
  cacheAPI: { label: "Cache API", color: "#fb923c", dim: "#fb923c22" },
};
export const OPERATIONS = [
  { id: "write", label: "Write" },
  { id: "read", label: "Read" },
  { id: "update", label: "Update" },
  { id: "delete", label: "Delete" },
  { id: "iterate", label: "Iterate" },
];

export const DEFAULT_JSON_TEMPLATE = `[
  {
    "id": 1,
    "text": "Example",
    "value": 42,
    "tags": ["alpha", "beta"]
  }
]`;

export const getStorageStyle = (label) =>
  Object.values(STORAGE_STYLES).find((s) => s.label === label);
