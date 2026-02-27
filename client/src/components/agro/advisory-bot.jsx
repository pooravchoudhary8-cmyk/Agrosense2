import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, X, Wand2, ChevronDown, ChevronUp,
    Droplets, StopCircle, Eye, Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import { useApp } from "@/context/app-context";

// ── Config ────────────────────────────────────────────────────────────────────
const BACKEND_URL = "";   // Proxy handles this
const POLL_INTERVAL_MS = 60_000;   // Auto-refresh advisory every 60 s
const AUTO_HIDE_MS = 20_000;   // Auto-hide popup after 20 s of inactivity

// ── Action styling ────────────────────────────────────────────────────────────
const ACTION_CFG = {
    PUMP_ON: { icon: Droplets, color: "text-blue-400", ring: "ring-blue-500/30", bg: "bg-blue-500/12", label: "Start Irrigation", dot: "bg-blue-500" },
    PUMP_OFF: { icon: StopCircle, color: "text-rose-400", ring: "ring-rose-500/30", bg: "bg-rose-500/12", label: "Stop Pump", dot: "bg-rose-500" },
    MONITOR: { icon: Eye, color: "text-amber-400", ring: "ring-amber-500/30", bg: "bg-amber-500/12", label: "Monitor Field", dot: "bg-amber-500" },
};

const CONFIDENCE_CFG = {
    high: { cls: "bg-emerald-500 text-white", label: "High" },
    medium: { cls: "bg-amber-500 text-white", label: "Medium" },
    low: { cls: "bg-slate-500 text-white", label: "Low" },
};

const URGENCY_CFG = {
    immediate: { cls: "text-rose-400", label: "⚡ Urgent" },
    soon: { cls: "text-amber-400", label: "⏳ Soon" },
    none: { cls: "text-emerald-400", label: "✓ Normal" },
};

// ── Fallback advisory builder (when RAG API is offline) ──────────────────────
function buildFallbackAdvisory(sensor) {
    const { soil_moisture = 0, rain_detected = false, temperature = 0, humidity = 0 } = sensor;

    if (rain_detected) {
        return {
            reasoning: "Rain is currently detected on your field sensors. The pump has been paused to prevent over-watering and soil erosion.",
            action: "PUMP_OFF",
            confidence: "high",
            urgency: "immediate",
            irrigation_needed: false,
            fullText: "Rain detected — no irrigation needed. Conserve water and monitor soil moisture over the next few hours before resuming irrigation.",
        };
    }

    if (soil_moisture < 20) {
        return {
            reasoning: `Soil moisture is critically low at ${soil_moisture}%. Your crops need water immediately to prevent wilting and root stress.`,
            action: "PUMP_ON",
            confidence: "high",
            urgency: "immediate",
            irrigation_needed: true,
            fullText: `Critical: Soil at ${soil_moisture}% moisture. Start irrigation immediately. For most crops, maintain 40–60% soil moisture. Run the pump until levels exceed 40% then reassess.`,
        };
    }

    if (soil_moisture < 35) {
        return {
            reasoning: `Soil moisture is at ${soil_moisture}% — below the optimal range. Plan irrigation soon to avoid crop stress.`,
            action: "PUMP_ON",
            confidence: "medium",
            urgency: "soon",
            irrigation_needed: true,
            fullText: `Soil moisture at ${soil_moisture}% — slightly dry. Start irrigation soon. Monitor temperature (${temperature}°C) and humidity (${humidity}%) to adjust schedule.`,
        };
    }

    return {
        reasoning: `Field conditions look good. Soil moisture at ${soil_moisture}%${rain_detected ? "" : ", no rain detected"}. Continue monitoring.`,
        action: "MONITOR",
        confidence: "medium",
        urgency: "none",
        irrigation_needed: false,
        fullText: `Soil moisture is ${soil_moisture}% — within optimal range. No immediate irrigation needed. Monitor temperature (${temperature}°C) and check again periodically.`,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdvisoryBot() {
    const { state } = useApp();
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [advisory, setAdvisory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const autoHideTimer = useRef(null);

    // ── Fetch advisory from RAG API via Node.js backend ──────────────────────
    const fetchAdvisory = useCallback(async (sensor) => {
        if (!sensor) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BACKEND_URL}/api/rag/advisory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    soil_moisture: sensor.soil_moisture ?? 0,
                    soil1_moisture: sensor.soil1_moisture ?? null,
                    soil2_moisture: sensor.soil2_moisture ?? null,
                    temperature: sensor.temperature ?? 0,
                    humidity: sensor.humidity ?? 0,
                    rain_detected: sensor.rain_detected ?? false,
                    crop_type: state.cropType ?? "Wheat",
                    crop_age_days: state.cropAgeDays ?? 45,
                    pump_on: state.pumpOn ?? false,
                    pump_mode: state.pumpMode ?? "AUTO",
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setAdvisory({ ...data, fullText: data.advisory });
                setLastUpdated(new Date());
                setVisible(true);
                scheduleAutoHide();
            } else {
                // Node backend responded but RAG API is offline — use fallback
                setAdvisory(buildFallbackAdvisory(sensor));
                setLastUpdated(new Date());
                setVisible(true);
                scheduleAutoHide();
            }
        } catch {
            // Network error — pure sensor-based fallback
            setError(null);
            setAdvisory(buildFallbackAdvisory(sensor));
            setLastUpdated(new Date());
            setVisible(true);
            scheduleAutoHide();
        } finally {
            setLoading(false);
        }
    }, [state.cropType, state.cropAgeDays, state.pumpOn, state.pumpMode]);

    // ── Auto-hide after inactivity ────────────────────────────────────────────
    const scheduleAutoHide = () => {
        if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
        autoHideTimer.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
    };

    // ── Trigger fetch when socket pushes a rag-advisory ──────────────────────
    useEffect(() => {
        if (state.aiAdvisory) {
            const adv = state.aiAdvisory;
            setAdvisory({
                reasoning: adv.reasoning || adv.message || "",
                action: adv.action || "MONITOR",
                confidence: adv.confidence || "medium",
                urgency: adv.urgency || "none",
                irrigation_needed: adv.needed ?? false,
                fullText: adv.fullText || adv.advisory || "",
                sensor: adv.sensorSnapshot,
            });
            setLastUpdated(new Date());
            setVisible(true);
            scheduleAutoHide();
        }
    }, [state.aiAdvisory]);

    // ── Poll on live sensor arrival (debounced to POLL_INTERVAL_MS) ──────────
    const lastFetchRef = useRef(0);
    useEffect(() => {
        const sensor = state.liveSensor;
        if (!sensor) return;

        const now = Date.now();
        if (now - lastFetchRef.current < POLL_INTERVAL_MS) return;
        lastFetchRef.current = now;

        fetchAdvisory(sensor);
    }, [state.liveSensor, fetchAdvisory]);

    // ── Fallback rules if no live MQTT data at all ────────────────────────────
    useEffect(() => {
        if (state.liveSensor || state.aiAdvisory || advisory) return;

        let fallbackAdv = null;
        if (state.rainDetected) {
            fallbackAdv = buildFallbackAdvisory({ rain_detected: true, soil_moisture: state.soilMoisture });
        } else if (state.soilMoisture > 0 && state.soilMoisture < 25) {
            fallbackAdv = buildFallbackAdvisory({ rain_detected: false, soil_moisture: state.soilMoisture, temperature: state.weather?.tempC, humidity: state.weather?.humidity });
        }

        if (fallbackAdv) {
            setAdvisory(fallbackAdv);
            setVisible(true);
            scheduleAutoHide();
        }
    }, [state.rainDetected, state.soilMoisture]);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    useEffect(() => () => { if (autoHideTimer.current) clearTimeout(autoHideTimer.current); }, []);

    // ── Derived styling ───────────────────────────────────────────────────────
    const action = advisory?.action || "MONITOR";
    const ACfg = ACTION_CFG[action] || ACTION_CFG.MONITOR;
    const ActionIcon = ACfg.icon;
    const confKey = advisory?.confidence || "low";
    const CCfg = CONFIDENCE_CFG[confKey] || CONFIDENCE_CFG.low;
    const urgency = advisory?.urgency || "none";
    const UCfg = URGENCY_CFG[urgency] || URGENCY_CFG.none;
    const hasData = !!advisory;
    const sensor = advisory?.sensor || state.liveSensor;

    const timeLabel = lastUpdated
        ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end pointer-events-none select-none">

            {/* ── Advisory card ────────────────────────────────────────────── */}
            <AnimatePresence>
                {visible && hasData && (
                    <motion.div
                        key="advisory-card"
                        initial={{ opacity: 0, y: 24, scale: 0.93 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.93 }}
                        transition={{ type: "spring", stiffness: 340, damping: 26 }}
                        className={`mb-4 w-[310px] pointer-events-auto rounded-2xl
                            bg-card/96 backdrop-blur-xl border border-border/60
                            shadow-2xl ring-2 ${ACfg.ring} overflow-hidden`}
                    >
                        {/* Top colour stripe */}
                        <div className={`h-1 w-full ${ACfg.dot}`} />

                        <div className="p-4">
                            {/* Header row */}
                            <div className="flex items-start gap-2.5 mb-3">
                                <div className={`mt-0.5 h-9 w-9 rounded-xl ${ACfg.bg} flex-shrink-0
                                    grid place-items-center border border-white/5`}>
                                    <ActionIcon size={18} className={ACfg.color} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Wand2 size={9} className="text-primary/80" />
                                        <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-primary/80">
                                            Kisan RAG Advisory
                                        </span>
                                        {/* Close */}
                                        <button
                                            onClick={() => { setVisible(false); if (autoHideTimer.current) clearTimeout(autoHideTimer.current); }}
                                            className="ml-auto h-5 w-5 rounded-full hover:bg-muted grid place-items-center
                                                text-muted-foreground hover:text-foreground transition"
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-foreground/90 leading-snug">
                                        {advisory.reasoning}
                                    </p>
                                </div>
                            </div>

                            {/* Action + badges row */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${ACfg.bg} mb-3`}>
                                <span className={`text-[11px] font-bold ${ACfg.color}`}>
                                    {ACfg.label}
                                </span>
                                <span className={`ml-auto text-[10px] font-semibold ${UCfg.cls}`}>
                                    {UCfg.label}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CCfg.cls}`}>
                                    {CCfg.label}
                                </span>
                            </div>

                            {/* Expandable full analysis */}
                            {advisory.fullText && advisory.fullText !== advisory.reasoning && (
                                <>
                                    <button
                                        onClick={() => setExpanded(v => !v)}
                                        className="flex items-center gap-1 text-[10px] text-muted-foreground
                                            hover:text-foreground transition mb-1 w-full"
                                    >
                                        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                        {expanded ? "Hide" : "Full"} RAG analysis
                                    </button>
                                    <AnimatePresence>
                                        {expanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30
                                                    text-[11px] text-foreground/75 leading-relaxed max-h-40 overflow-y-auto
                                                    scrollbar-thin scrollbar-thumb-border mb-2">
                                                    {advisory.fullText}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}

                            {/* Footer: sensor snapshot + timestamp */}
                            <div className="flex items-center justify-between text-[9.5px] text-muted-foreground pt-2 border-t border-border/40">
                                <span>
                                    {sensor
                                        ? `💧${sensor.soil_moisture ?? state.soilMoisture}% · 🌡${sensor.temperature ?? state.weather?.tempC ?? "--"}°C · 💦${sensor.humidity ?? state.weather?.humidity ?? "--"}%`
                                        : `💧${state.soilMoisture}% · 🌡${state.weather?.tempC ?? "--"}°C`
                                    }
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {timeLabel && <span>{timeLabel}</span>}
                                    <span className={`h-1.5 w-1.5 rounded-full ${ACfg.dot} animate-pulse`} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating Bot Button ───────────────────────────────────────── */}
            <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                    if (!visible && !hasData && state.liveSensor) {
                        fetchAdvisory(state.liveSensor);
                    } else {
                        setVisible(v => !v);
                        setExpanded(false);
                    }
                }}
                className="pointer-events-auto relative h-16 w-16 rounded-2xl bg-primary
                    text-primary-foreground shadow-2xl grid place-items-center
                    ring-4 ring-background hover:shadow-primary/30 transition-shadow group"
                data-testid="button-advisory-bot"
                title="Kisan RAG Advisory"
            >
                {loading
                    ? <Loader2 size={28} className="animate-spin opacity-80" />
                    : <Bot size={30} className="group-hover:scale-110 transition-transform" />
                }

                {/* Pulse ring when there's a new message */}
                {hasData && !visible && (
                    <>
                        <span className="absolute inset-0 rounded-2xl ring-2 ring-primary animate-ping opacity-25" />
                        <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full ${ACfg.dot}
                            border-2 border-background flex items-center justify-center text-[9px] font-bold text-white shadow`}>
                            !
                        </span>
                    </>
                )}

                {/* RAG active indicator dot */}
                <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full border border-background
                    ${hasData ? ACfg.dot : "bg-slate-400"}`} />
            </motion.button>
        </div>
    );
}
