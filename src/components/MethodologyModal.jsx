import GhostBtn from "./ui/GhostBtn";

export default function MethodologyModal({ onClose }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: 24,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#0d1117",
                    border: "1px solid #1f2937",
                    borderRadius: 14,
                    padding: 28,
                    maxWidth: 540,
                    width: "100%",
                    boxShadow: "0 32px 64px #000000aa",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: 20,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#e2e8f0",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Методология
                        </h3>
                        <p style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
                            Ограничения и различия между браузерами, которые следует учитывать.
                        </p>
                    </div>
                    <GhostBtn onClick={onClose}>✕</GhostBtn>
                </div>
                {[
                    {
                        title: "LocalStorage",
                        color: "#a78bfa",
                        points: [
                            "Синхронный — большие объемы данных блокируют главный поток.",
                            "Размер: ~5–10 МБ на origin, зависит от браузера.",
                            "Недоступен в приватном режиме и на URL-адресах file://.",
                        ],
                    },
                    {
                        title: "IndexedDB",
                        color: "#38bdf8",
                        points: [
                            "Asynchronous with transactions; batching improves throughput.",
                            "Большой размер, но все еще может быть удалена браузером.",
                            "Safari / iOS могут иметь более строгие ограничения или блокировку в приватном режиме.",
                        ],
                    },
                    {
                        title: "Cache API",
                        color: "#fb923c",
                        points: [
                            "Синхронный API для управления кэшем.",
                            "Зависит от браузера, может быть ограничен или заблокирован.",
                            "Требует безопасного происхождения (HTTPS или localhost); недоступен на file://.",
                        ],
                    },
                ].map((section) => (
                    <div key={section.title} style={{ marginBottom: 18 }}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: section.color,
                                marginBottom: 8,
                            }}
                        >
                            {section.title}
                        </div>
                        <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                            {section.points.map((p, i) => (
                                <li key={i} style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
