import { STORAGE_STYLES } from "../../constants";
import StorageDot from "../ui/StorageDot";
import GhostBtn from "../ui/GhostBtn";
import PrimaryBtn from "../ui/PrimaryBtn";
import Section from "../ui/Section";
import { STORAGE_TARGETS, OPERATIONS } from "../../constants";

export default function RunPanel({
    config,
    status,
    stop,
    run,
    results,
    progress,
    errorLog,
    addToast,
}) {
    const selectedStorage = STORAGE_TARGETS.filter((t) => config.storageTargets[t.id]).map((t) => t.label);
    const selectedOperations = OPERATIONS.filter((o) => config.operations[o.id]).map((o) => o.label);
    const canStart = selectedStorage.length > 0 && selectedOperations.length > 0;
    const progressPercent = progress.total
        ? Math.min(100, Math.round((progress.current / progress.total) * 100))
        : 0;
    return (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
                    Запуск теста
                </h2>
                <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                    Запустите тест с текущей конфигурацией.
                </p>
            </div>

            <Section>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div
                            style={{ fontSize: 10, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}
                        >
                            Текущая конфигурация
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
                            {config.dataSize} · {config.keyCount === "10000" ? "10 000" : config.keyCount} Ключей
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#4b5563" }}>Хранилища:</span>
                            {selectedStorage.length
                                ? selectedStorage.map((l) => <StorageDot key={l} label={l} />)
                                : <span style={{ fontSize: 11, color: "#4b5563" }}>None selected</span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#4b5563" }}>
                            <span style={{ fontSize: 11, color: "#4b5563" }}>Операции:</span> {selectedOperations.join(" · ") || "None"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        {status === "running" ? (
                            <GhostBtn onClick={stop} danger>
                                ■ Стоп
                            </GhostBtn>
                        ) : (
                            <PrimaryBtn
                                disabled={!canStart}
                                onClick={() =>
                                    run(config, {
                                        onWarning: addToast,
                                        onError: (entry) => addToast(`Error: ${entry.message}`),
                                    })
                                }
                            >
                                ▶ Запустить
                            </PrimaryBtn>
                        )}
                        <span style={{ fontSize: 10, color: "#374151" }}>{results.length} результатов</span>
                    </div>
                </div>
            </Section>

            <Section>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5563" }}>
                        <span>
                            {progress.label
                                ? (() => {
                                    const s = Object.values(STORAGE_STYLES).find((st) => progress.label.includes(st.label));
                                    return s ? (
                                        <>
                                            <StorageDot label={s.label} /> {progress.label.replace(s.label, "").trim()}
                                        </>
                                    ) : progress.label;
                                })()
                                : "Готов к запуску."}
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            {progress.current} / {progress.total}
                        </span>
                    </div>
                    <div style={{ height: 4, background: "#1f2937", borderRadius: 4, overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                borderRadius: 4,
                                background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                                width: `${progressPercent}%`,
                                transition: "width 0.2s ease",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#374151" }}>
                        <span>
                            Status:{" "}
                            <span
                                style={{
                                    color:
                                        status === "running"
                                            ? "#a78bfa"
                                            : status === "done"
                                                ? "#34d399"
                                                : "#4b5563",
                                }}
                            >
                                {status}
                            </span>
                        </span>
                        <span>{progressPercent}%</span>
                    </div>
                </div>
            </Section>

            {errorLog.length > 0 && (
                <Section>
                    <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#fca5a5",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Errors ({errorLog.length})
                        </div>
                        <span style={{ fontSize: 10, color: "#4b5563" }}>Latest first</span>
                    </div>
                    {errorLog.some((e) => e.reason === "quota") && (
                        <div
                            style={{
                                fontSize: 10,
                                color: "#fbbf24",
                                background: "#7c2d1233",
                                border: "1px solid #f59e0b44",
                                borderRadius: 6,
                                padding: "8px 12px",
                                marginBottom: 10,
                            }}
                        >
                            💡 <strong>Превышен лимит:</strong> Ожидаемое поведение для LocalStorage
                        </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {errorLog.slice(0, 5).map((entry) => (
                            <div key={entry.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10, color: "#6b7280" }}>
                                    <span>{entry.time}</span>
                                    {entry.target && <span>Target: {entry.target}</span>}
                                    {entry.operation && <span>Op: {entry.operation}</span>}
                                    {entry.stage && <span>Stage: {entry.stage}</span>}
                                    {entry.reason && (
                                        <span style={{ color: entry.reason === "quota" ? "#f87171" : "#6b7280" }}>
                                            Reason: {entry.reason}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 11, color: "#f87171" }}>{entry.message}</div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
