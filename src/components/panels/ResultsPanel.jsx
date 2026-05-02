import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import StorageDot from "../ui/StorageDot";
import GhostBtn from "../ui/GhostBtn";
import Section from "../ui/Section";
import { useState, useMemo } from "react";
import { formatDataSize, formatNumber } from "../../utils/formatters";
import { getStorageStyle } from "../../constants";

const tooltipStyle = {
    background: "#0d1117",
    border: "1px solid #1f2937",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 12,
};

export default function ResultsPanel({
    results,
    clearResults,
}) {

    const [resultsView, setResultsView] = useState("table");
    const [sortConfig, setSortConfig] = useState({ key: "timeAvg", direction: "desc" });
    const handleSort = (key) =>
        setSortConfig((c) => ({ key, direction: c.key === key && c.direction === "asc" ? "desc" : "asc" }));

    const resultRows = useMemo(() => {
        const grouped = new Map();
        results.forEach((entry) => {
            const key = `${entry.target}|${entry.operation}|${entry.keyCount}|${entry.dataSize}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    storage: entry.target, operation: entry.operation,
                    keys: entry.keyCount, dataSize: entry.dataSize,
                    duration: Number(entry.duration) || 0, status: entry.status || "ok",
                });
            }
        });
        return Array.from(grouped.values()).map((entry, i) => {
            return {
                id: `${entry.storage}-${entry.operation}-${entry.dataSize}-${i}`,
                storage: entry.storage, operation: entry.operation,
                keys: entry.keys, dataSize: entry.dataSize,
                time: entry.duration,
                ops: entry.duration > 0 ? entry.keys / (entry.duration / 1000) : 0,
                status: entry.status,
            };
        });
    }, [results]);

    const sortedRows = useMemo(() => {
        const sorted = [...resultRows];
        const { key, direction } = sortConfig;
        sorted.sort((a, b) => {
            const m = direction === "asc" ? 1 : -1;
            return typeof a[key] === "number"
                ? (a[key] - b[key]) * m
                : String(a[key]).localeCompare(String(b[key])) * m;
        });
        return sorted;
    }, [resultRows, sortConfig]);

    const uniqueStorages = useMemo(() => [...new Set(results.map((e) => e.target))], [results]);
    const uniqueOperations = useMemo(() => [...new Set(results.map((e) => e.operation))], [results]);

    const groupedBarData = useMemo(
        () => uniqueOperations.map((op) => {
            const row = { operation: op };
            uniqueStorages.forEach((s) => { row[s] = results.find((e) => e.target === s && e.operation === op)?.duration || 0; });
            return row;
        }),
        [uniqueOperations, uniqueStorages, results]
    );

    const sizeValues = useMemo(
        () => [...new Set(results.map((e) => e.dataSize))].sort((a, b) => a - b),
        [results]
    );

    const lineChartData = useMemo(
        () => sizeValues.map((size) => {
            const row = { size, sizeLabel: formatDataSize(size) };
            uniqueStorages.forEach((s) => { row[s] = results.find((e) => e.target === s && e.dataSize === size)?.duration || 0; });
            return row;
        }),
        [sizeValues, uniqueStorages, results]
    );

    const heatmapCells = useMemo(() => {
        const vals = [];
        uniqueStorages.forEach((s) => uniqueOperations.forEach((op) => {
            const v = results.find((e) => e.target === s && e.operation === op)?.duration || 0;
            if (v !== 0) vals.push(v);
        }));
        return { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 1 };
    }, [uniqueStorages, uniqueOperations, results]);

    return (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 8,
                }}
            >
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
                        Результаты
                    </h2>
                    <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                        Исследуйте характеристики различных хранилищ.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            background: "#0d1117",
                            border: "1px solid #1f2937",
                            borderRadius: 7,
                            padding: 3,
                            gap: 3,
                        }}
                    >
                        {[
                            { id: "table", label: "Таблица" },
                            { id: "chart", label: "График" },
                            { id: "heatmap", label: "Тепловая карта" },
                        ].map((v) => (
                            <button
                                key={v.id}
                                type="button"
                                className={`tab-btn${resultsView === v.id ? " active" : ""}`}
                                onClick={() => setResultsView(v.id)}
                                style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    padding: "5px 12px",
                                    borderRadius: 5,
                                    border: "none",
                                    cursor: "pointer",
                                    background: "transparent",
                                    color: resultsView === v.id ? "#e2e8f0" : "#4b5563",
                                    transition: "all 0.1s",
                                }}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>
                    <GhostBtn onClick={clearResults} disabled={results.length === 0}>
                        Очистить
                    </GhostBtn>
                </div>
            </div>

            {results.length === 0 ? (
                <Section>
                    <div style={{ textAlign: "center", padding: "32px 0", color: "#374151", fontSize: 12 }}>
                        Запустите тест для появления результатов.
                    </div>
                </Section>
            ) : resultsView === "table" ? (
                <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #1a1f2e" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                            <tr style={{ background: "#0d1117", borderBottom: "1px solid #1a1f2e" }}>
                                {[
                                    { key: "storage", label: "Storage" },
                                    { key: "operation", label: "Operation" },
                                    { key: "keys", label: "Keys" },
                                    { key: "dataSize", label: "Size" },
                                    { key: "time", label: "Time (ms)" },
                                    { key: "ops", label: "Ops/sec" },
                                    { key: "status", label: "Status" },
                                ].map((col) => (
                                    <th key={col.key} style={{ padding: "10px 14px", textAlign: "left" }}>
                                        <button
                                            type="button"
                                            className="sort-btn"
                                            onClick={() => handleSort(col.key)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: "#4b5563",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            {col.label}
                                            {sortConfig.key === col.key && (
                                                <span style={{ color: "#6366f1" }}>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                            )}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRows.map((row) => (
                                <tr key={row.id} style={{ borderBottom: "1px solid #111827" }}>
                                    <td style={{ padding: "9px 14px" }}>
                                        <StorageDot label={row.storage} />
                                    </td>
                                    <td style={{ padding: "9px 14px", color: "#9ca3af", fontWeight: 500 }}>{row.operation}</td>
                                    <td style={{ padding: "9px 14px", color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>
                                        {formatNumber(row.keys)}
                                    </td>
                                    <td style={{ padding: "9px 14px", color: "#6b7280" }}>{formatDataSize(row.dataSize)}</td>
                                    <td style={{ padding: "9px 14px", color: "#a5b4fc", fontVariantNumeric: "tabular-nums" }}>
                                        {row.time.toFixed(2)}
                                    </td>
                                    <td style={{ padding: "9px 14px", color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>
                                        {formatNumber(Math.round(row.ops))}
                                    </td>
                                    <td style={{ padding: "9px 14px" }}>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                                letterSpacing: "0.04em",
                                                background: row.status === "ok" ? "#052e1633" : "#450a0a33",
                                                border: `1px solid ${row.status === "ok" ? "#16a34a44" : "#dc262644"}`,
                                                color: row.status === "ok" ? "#4ade80" : "#f87171",
                                            }}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : resultsView === "chart" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Section>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#6b7280",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: 16,
                            }}
                        >
                            Затраченное на операцию время (ms)
                        </div>
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={groupedBarData} barSize={20}>
                                    <CartesianGrid strokeDasharray="2 4" stroke="#1a1f2e" vertical={false} />
                                    <XAxis dataKey="operation" stroke="#374151" fontSize={10} tick={{ fill: "#6b7280" }} />
                                    <YAxis stroke="#374151" fontSize={10} tick={{ fill: "#6b7280" }} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v).toFixed(2)} ms`} />
                                    <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                    {uniqueStorages.map((s) => {
                                        const style = getStorageStyle(s);
                                        return <Bar key={s} dataKey={s} fill={style?.color || "#6366f1"} radius={[4, 4, 0, 0]} />;
                                    })}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>
                </div>
            ) : (
                <Section>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 16,
                        }}
                    >
                        Тепловая карта (медленнее = краснее)
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `120px repeat(${uniqueOperations.length}, minmax(90px, 1fr))`,
                                gap: 4,
                                minWidth: 400,
                            }}
                        >
                            <div />
                            {uniqueOperations.map((op) => (
                                <div
                                    key={op}
                                    style={{
                                        fontSize: 10,
                                        color: "#4b5563",
                                        textAlign: "center",
                                        padding: "4px 0",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    {op}
                                </div>
                            ))}
                            {uniqueStorages.map((storage) => (
                                <div key={storage} style={{ display: "contents" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <StorageDot label={storage} />
                                    </div>
                                    {uniqueOperations.map((op) => {
                                        const value = results.find((e) => e.target === storage && e.operation === op)?.duration || 0;
                                        const ratio =
                                            value === null
                                                ? 0
                                                : heatmapCells.max === heatmapCells.min
                                                    ? 0
                                                    : (value - heatmapCells.min) / (heatmapCells.max - heatmapCells.min);
                                        const r = Math.round(20 + ratio * 220);
                                        const g = Math.round(180 - ratio * 150);
                                        const bg = value === null ? "#111827" : `rgba(${r},${g},40,0.35)`;
                                        const border = value === null ? "#1f2937" : `rgba(${r},${g},40,0.5)`;
                                        return (
                                            <div
                                                key={`${storage}-${op}`}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "10px 6px",
                                                    borderRadius: 6,
                                                    border: `1px solid ${border}`,
                                                    background: bg,
                                                    fontSize: 11,
                                                    color: value === null ? "#374151" : "#e2e8f0",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                {value === null ? "—" : `${value.toFixed(1)}`}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            )}
        </div>
    );
}
