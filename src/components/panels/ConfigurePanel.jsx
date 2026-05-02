import {
    DATA_SIZES,
    DEFAULT_JSON_TEMPLATE,
    KEY_COUNTS,
    OPERATIONS,
    STORAGE_STYLES,
    STORAGE_TARGETS,
} from "../../constants";
import Chip from "../ui/Chip";
import Field from "../ui/Field";
import GhostBtn from "../ui/GhostBtn";
import PrimaryBtn from "../ui/PrimaryBtn";
import Section from "../ui/Section";

export default function ConfigurePanel({ config, updateConfig, setActiveTab }) {
    return (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ marginBottom: 8 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
                    Конфигурация
                </h2>
                <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                    Настройте данные и нагрузку перед запуском теста.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Section>
                    <Field label="Размер данных">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {DATA_SIZES.map((size) => (
                                <Chip
                                    key={size}
                                    active={config.dataSize === size}
                                    onClick={() => updateConfig("dataSize", size)}
                                >
                                    {size}
                                </Chip>
                            ))}
                        </div>
                    </Field>
                </Section>

                <Section>
                    <Field label="Тип данных">
                        <div
                            style={{
                                display: "flex",
                                gap: 0,
                                background: "#0a0c0f",
                                border: "1px solid #1f2937",
                                borderRadius: 7,
                                padding: 3,
                            }}
                        >
                            {[
                                { id: "json", label: "JSON Objects" },
                                { id: "raw", label: "Raw Bytes" },
                            ].map((dt) => (
                                <button
                                    key={dt.id}
                                    type="button"
                                    onClick={() => updateConfig("dataType", dt.id)}
                                    style={{
                                        flex: 1,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        padding: "5px 10px",
                                        borderRadius: 5,
                                        border: "none",
                                        cursor: "pointer",
                                        background: config.dataType === dt.id ? "#1f2937" : "transparent",
                                        color: config.dataType === dt.id ? "#e2e8f0" : "#4b5563",
                                        transition: "all 0.12s",
                                    }}
                                >
                                    {dt.label}
                                </button>
                            ))}
                        </div>
                    </Field>
                </Section>
            </div>

            {config.dataType === "json" ? (
                <Section>
                    <Field label="Шаблон JSON" hint="— дублирование до достижения целевого размера">
                        <textarea
                            value={config.jsonTemplate || DEFAULT_JSON_TEMPLATE}
                            onChange={(e) => updateConfig("jsonTemplate", e.target.value)}
                            style={{
                                width: "100%",
                                height: 140,
                                background: "#0a0c0f",
                                border: "1px solid #1f2937",
                                borderRadius: 7,
                                padding: "10px 14px",
                                fontSize: 11,
                                color: "#a5b4fc",
                                resize: "vertical",
                                outline: "none",
                                lineHeight: 1.7,
                            }}
                        />
                    </Field>
                </Section>
            ) : (
                <Section>
                    <Field label="Шаблон сырых байтов" hint="— паттерн для генерации данных">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {[
                                { id: "random", label: "Random" },
                                { id: "zeros", label: "Zeros" },
                                { id: "repeat", label: "Repeating 0xAB…" },
                            ].map((p) => (
                                <Chip
                                    key={p.id}
                                    active={config.rawPattern === p.id}
                                    onClick={() => updateConfig("rawPattern", p.id)}
                                >
                                    {p.label}
                                </Chip>
                            ))}
                        </div>
                    </Field>
                </Section>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Section>
                    <Field label="Количество ключей" hint="— один большой vs много маленьких">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {KEY_COUNTS.map((count) => (
                                <Chip
                                    key={count}
                                    active={config.keyCount === count}
                                    onClick={() => updateConfig("keyCount", count)}
                                >
                                    {count === "10000" ? "10 000" : count}
                                </Chip>
                            ))}
                        </div>
                    </Field>
                </Section>
                <Section>
                    <Field label="Цели теста" hint="— где хранить данные">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {STORAGE_TARGETS.map((target) => {
                                const s = STORAGE_STYLES[target.id];
                                const active = config.storageTargets[target.id];
                                return (
                                    <button
                                        key={target.id}
                                        type="button"
                                        onClick={() =>
                                            updateConfig("storageTargets", {
                                                ...config.storageTargets,
                                                [target.id]: !active,
                                            })
                                        }
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 7,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            padding: "5px 12px",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            transition: "all 0.12s",
                                            border: active ? `1px solid ${s.color}44` : "1px solid #1f2937",
                                            background: active ? s.dim : "transparent",
                                            color: active ? s.color : "#4b5563",
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: "50%",
                                                background: active ? s.color : "#374151",
                                                flexShrink: 0,
                                            }}
                                        />
                                        {target.label}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>
                </Section>
            </div>


            <Section>
                <Field label="Операции">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {OPERATIONS.map((op) => (
                            <Chip
                                key={op.id}
                                active={config.operations[op.id]}
                                onClick={() =>
                                    updateConfig("operations", {
                                        ...config.operations,
                                        [op.id]: !config.operations[op.id],
                                    })
                                }
                            >
                                {op.label}
                            </Chip>
                        ))}
                    </div>
                </Field>
            </Section>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 8,
                    paddingTop: 4,
                }}
            >
                <PrimaryBtn onClick={() => setActiveTab("run")}>Сохранить и продолжить →</PrimaryBtn>
            </div>
        </div>
    );
}
