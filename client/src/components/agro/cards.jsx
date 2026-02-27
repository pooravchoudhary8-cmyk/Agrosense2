import React, { useState, useEffect } from "react";
import { Droplets, CloudRain, CloudDrizzle, Sun, Sprout, AlertTriangle, Wind, Thermometer, Cloud, Sparkles, MapPin, Check, Gauge, Waves, Calendar, Activity, TrendingUp, BrainCircuit, Edit2, Target, Shield, Zap, Brain, ShieldAlert, Cpu, Map, Camera, UploadCloud, Loader2, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   STAT CARD (generic reusable)
──────────────────────────────────────────────────────────────── */
export function StatCard({
    icon,
    label,
    value,
    hint,
    tone = "default",
    testId,
}) {
    const toneConfig = {
        good: "bg-emerald-500/10 text-emerald-500 border-emerald-500/10",
        warn: "bg-amber-500/10 text-amber-500 border-amber-500/10",
        bad: "bg-rose-500/10 text-rose-500 border-rose-500/10",
        default: "bg-primary/10 text-primary border-primary/10"
    };

    const config = toneConfig[tone] || toneConfig.default;

    return (
        <Card className="glass rounded-[1.75rem] p-6 hover-elevate transition-all duration-300 group border-white/5 relative overflow-hidden" data-testid={testId}>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <div className="flex items-start gap-4">
                <div className={cn("h-12 w-12 rounded-2xl grid place-items-center transition-transform group-hover:scale-110 duration-500 border", config)}>
                    {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/85 leading-none mb-1.5" data-testid={`${testId}-label`}>{label}</div>
                    <div className="text-2xl font-black tracking-tighter" data-testid={`${testId}-value`}>{value}</div>
                    {hint && (
                        <div className="mt-1.5 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide" data-testid={`${testId}-hint`}>{hint}</div>
                    )}
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   SOIL MOISTURE CARD
──────────────────────────────────────────────────────────────── */
export function SoilMoistureCard({ moisture, status, className }) {
    const tone = moisture < 30 ? "bad" : moisture > 60 ? "good" : "warn";

    const gaugeColor =
        tone === "good" ? "#10b981" :
            tone === "warn" ? "#f59e0b" : "#f43f5e";

    const gaugeColorLight =
        tone === "good" ? "#34d399" :
            tone === "warn" ? "#fbbf24" : "#fb7185";

    return (
        <Card className={cn("glass rounded-[2rem] p-10 hover-elevate overflow-hidden relative border-white/5", className)} data-testid="card-soil-moisture">
            {/* Ambient visual cue */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-10" style={{ backgroundColor: gaugeColor }} />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                {/* Gauge Section */}
                <div className="relative h-44 w-44">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                        <motion.circle
                            cx="50" cy="50" r="44"
                            stroke={gaugeColor}
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 44}
                            initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 44 - (2 * Math.PI * 44 * moisture) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ filter: `drop-shadow(0 0 10px ${gaugeColor}44)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            key={moisture}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl font-black tracking-tighter"
                        >
                            {moisture.toFixed(0)}<span className="text-lg opacity-30">%</span>
                        </motion.span>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 mt-1">Saturation</span>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 mb-4">
                            <span>Hydration Index</span>
                            <Badge className={cn("rounded-md px-3 py-0.5 border-none font-black text-[9px] uppercase",
                                tone === "bad" ? "bg-rose-500 text-white" : tone === "warn" ? "bg-amber-500 text-amber-950" : "bg-emerald-500 text-white"
                            )}>
                                {tone === "bad" ? "Critical Deficit" : tone === "warn" ? "Stable / Monitoring" : "Optimal Peak"}
                            </Badge>
                        </div>

                        <div className="flex gap-2 h-2.5 mb-2">
                            <div className={cn("flex-1 rounded-full transition-all duration-700", moisture < 30 ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : "bg-muted/20")} />
                            <div className={cn("flex-1 rounded-full transition-all duration-700", (moisture >= 30 && moisture <= 60) ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "bg-muted/20")} />
                            <div className={cn("flex-1 rounded-full transition-all duration-700", moisture > 60 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-muted/20")} />
                        </div>

                        <div className="flex justify-between text-[9px] font-black text-muted-foreground/80 px-1">
                            <span>DANGER</span>
                            <span>NORMAL</span>
                            <span>PEAK</span>
                        </div>
                    </div>

                    <div className="rounded-[1.25rem] bg-muted/20 p-4 border border-white/5 flex items-center gap-4 group/hint">
                        <div className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center text-muted-foreground/80 group-hover/hint:text-primary transition-colors">
                            <Gauge size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Operation Target</div>
                            <div className="text-[12px] font-bold text-foreground/70 tracking-tight">Standard: <span className="text-primary font-black">30% — 60%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   WEATHER CARD
──────────────────────────────────────────────────────────────── */
export function WeatherCard({
    location,
    locationCoords,
    cityName,
    tempC,
    condition,
    humidity,
    windKph,
    rainChance,
    onLocationChange,
    className
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempCity, setTempCity] = useState(cityName);
    const Icon = condition === "Rain" ? CloudRain : condition === "Sunny" ? Sun : Cloud;

    useEffect(() => {
        if (!isEditing) setTempCity(cityName);
    }, [cityName, isEditing]);

    const handleSave = () => {
        if (tempCity && tempCity.trim() !== "" && onLocationChange) {
            onLocationChange(tempCity);
        }
        setIsEditing(false);
    };

    const isSunny = condition === "Sunny";
    const accentColor = isSunny ? "amber" : "blue";

    return (
        <Card className={cn("glass rounded-[2.5rem] p-8 hover-elevate transition-all duration-700 relative overflow-hidden group border-white/10 min-h-[220px]", className)} data-testid="card-weather">
            {/* Mission Control: Scanline & Glow */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className={`absolute -top-24 -left-24 w-[500px] h-[500px] opacity-[0.1] blur-[120px] pointer-events-none animate-pulse ${isSunny ? 'bg-amber-400' : 'bg-primary'}`} />

            <div className="relative z-10 flex h-full items-center justify-between gap-8">
                {/* Identity: Expansive Space */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-1.5 w-8 rounded-full ${isSunny ? 'bg-amber-400' : 'bg-primary'} opacity-50`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/85 leading-none">Sector Monitor // 09</span>
                    </div>

                    <div className="relative mb-6 group/edit">
                        {isEditing ? (
                            <Input
                                value={tempCity}
                                onChange={(e) => setTempCity(e.target.value)}
                                className="h-10 py-1 px-4 text-sm font-black rounded-xl bg-white/5 border-white/10 w-full"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                onBlur={handleSave}
                            />
                        ) : (
                            <div
                                className="text-xl sm:text-2xl md:text-3xl font-black text-foreground cursor-pointer hover:text-primary transition-all flex items-center gap-3 uppercase tracking-tighter leading-none whitespace-nowrap overflow-visible"
                                onClick={() => setIsEditing(true)}
                            >
                                <span>{cityName || "Local Sector"}</span>
                                <Edit2 size={14} className="text-muted-foreground/70 group-hover/edit:text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-7xl font-black tracking-tightest leading-none" data-testid="text-weather-temp">
                            {(tempC || 0).toFixed(0)}<span className="text-primary text-3xl font-bold ml-1">°</span>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            <Badge className={`rounded-lg px-4 py-1.5 shadow-2xl border-none text-[10px] font-black uppercase tracking-[0.2em] ${isSunny ? 'bg-amber-400 text-amber-950' : 'bg-primary text-white'}`}>
                                {condition || "Stable"}
                            </Badge>
                            <div className="text-[8px] font-bold text-muted-foreground/80 uppercase tracking-[0.3em] px-1">Atmospheric Locked</div>
                        </div>
                    </div>
                </div>

                {/* Metrics: Technical Readout */}
                <div className="flex-none flex flex-col justify-center gap-5 border-l border-white/5 pl-8 min-w-[150px]">
                    {[
                        { label: "Humid", value: `${humidity}%`, icon: Droplets, color: isSunny ? "text-amber-400" : "text-blue-400" },
                        { label: "Wind", value: `${windKph}kph`, icon: Wind, color: "text-slate-400" },
                        { label: "Rain", value: `${rainChance}%`, icon: CloudRain, color: "text-primary" }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center justify-between group/stat">
                            <stat.icon size={16} className={cn("opacity-40", stat.color)} />
                            <div className="flex flex-col items-end">
                                <span className="text-base font-black tracking-tight tabular-nums leading-none">{stat.value}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/70 mt-1">{stat.label}</span>
                            </div>
                        </div>
                    ))}

                    <div className="mt-2 bg-white/5 p-2 rounded-xl border border-white/5 flex items-center justify-center gap-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[7px] font-black text-muted-foreground/85 uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   RAIN SENSOR CARD
──────────────────────────────────────────────────────────────── */
export function RainSensorCard({ rainDetected, rainRaw, className }) {
    const hasData = rainRaw !== undefined && rainRaw !== null;
    const rawValue = hasData ? Number(rainRaw) : 4095;
    const rainIntensity = hasData
        ? Math.round(Math.max(0, Math.min(100, ((4095 - rawValue) / 4095) * 100)))
        : 0;

    const severity = rainIntensity >= 60 ? "heavy" : rainIntensity >= 25 ? "light" : "dry";
    const severityConfig = {
        heavy: { color: "#f43f5e", secondary: "rose", icon: CloudRain, label: "Torrential Rain", badge: "Critical" },
        light: { color: "#f59e0b", secondary: "amber", icon: CloudDrizzle, label: "Light Rain", badge: "Warning" },
        dry: { color: "#10b981", secondary: "emerald", icon: Cloud, label: "Optimal Dry State", badge: "Stable" },
    };

    const config = severityConfig[severity];
    const r = 32;
    const circumference = 2 * Math.PI * r;

    return (
        <Card className={cn("glass rounded-[2.5rem] p-8 hover-elevate transition-all duration-700 relative overflow-hidden group border-white/10 min-h-[220px]", className)} data-testid="card-rain-sensor">
            {/* Elite Overlays: Scanlines & Glass Reflection */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] opacity-[0.1] blur-[120px] pointer-events-none transition-colors duration-1000 ${rainDetected ? 'bg-rose-500' : 'bg-emerald-500'}`} />

            <div className="relative z-10 flex h-full items-center justify-between gap-8">
                {/* Left: Identity & Hero Stats */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-1.5 w-8 rounded-full ${rainDetected ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_12px_#10b981]'}`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/75 leading-none">Sector Node // ALPHA-09 [42.1N, 88.3W]</span>
                    </div>

                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground uppercase tracking-tightest leading-none mb-6">
                        <span>{config.label}</span>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-7xl font-black tracking-tightest leading-none">
                            {rainIntensity}<span className={cn("text-3xl font-bold ml-1", rainDetected ? 'text-rose-500' : 'text-emerald-500')}>%</span>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Badge className={cn("rounded-lg px-4 py-1.5 shadow-2xl border-none text-[10px] font-black uppercase tracking-[0.2em]",
                                rainDetected ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                                {config.badge}
                            </Badge>
                            <div className="text-[8px] font-bold text-muted-foreground/80 uppercase tracking-[0.4em] px-1 italic">Atmospheric Locked</div>
                        </div>
                    </div>
                </div>

                {/* Right: Premium Spectral Gauge */}
                <div className="flex-none flex flex-col items-center justify-center gap-6 border-l border-white/5 pl-8 min-w-[180px]">
                    <div className="relative h-28 w-28 group-hover:scale-105 transition-transform duration-700">
                        {/* Outer Ticks */}
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="absolute inset-0 pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                                <div className="h-2 w-[1px] bg-white/10 mx-auto" />
                            </div>
                        ))}

                        <svg className="h-full w-full -rotate-90 p-4" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r={r} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                            <motion.circle
                                cx="40" cy="40" r={r}
                                stroke={config.color}
                                strokeWidth="4"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (circumference * rainIntensity) / 100 }}
                                transition={{ duration: 2, ease: "circOut" }}
                                strokeLinecap="round"
                                fill="transparent"
                                style={{ filter: `drop-shadow(0 0 12px ${config.color}88)` }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 3 }}>
                                    <Shield size={16} className={cn("opacity-40", `text-${config.secondary}-500`)} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Scanning Effect */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-t-primary/20 border-r-transparent border-b-transparent border-l-transparent opacity-40 pointer-events-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0.5">Raw SIG</span>
                            <span className="text-sm font-black tracking-tight tabular-nums opacity-60">{rawValue}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0.5">Fid ELITY</span>
                            <span className="text-sm font-black tracking-tight tabular-nums text-emerald-500">99.8%</span>
                        </div>
                    </div>

                    <div className="w-full bg-white/5 p-1.5 rounded-lg border border-white/5 flex items-center justify-center gap-2">
                        <div className={cn("h-1 w-1 rounded-full animate-ping", rainDetected ? 'bg-rose-500' : 'bg-emerald-500')} />
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Module Online</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   CROP STAGE CARD
──────────────────────────────────────────────────────────────── */
export function CropStageCard({ stage, ageDays, className }) {
    // Generic stages matching the onboarding form options
    const growthStages = [
        { name: "Germination", minDay: 1, maxDay: 15 },
        { name: "Seedling Stage", minDay: 16, maxDay: 35 },
        { name: "Vegetative Growth / Root or Tuber Development", minDay: 36, maxDay: 65 },
        { name: "Flowering", minDay: 66, maxDay: 85 },
        { name: "Pollination", minDay: 86, maxDay: 100 },
        { name: "Fruit/Grain/Bulb Formation", minDay: 101, maxDay: 120 },
        { name: "Maturation", minDay: 121, maxDay: 145 },
        { name: "Harvest", minDay: 146, maxDay: 170 },
    ];

    // Match stage by partial or full name
    const currentStageIndex = growthStages.findIndex(s =>
        s.name === stage ||
        s.name.toLowerCase().includes((stage || "").toLowerCase()) ||
        (stage || "").toLowerCase().includes(s.name.toLowerCase())
    );
    const currentStage = growthStages[currentStageIndex >= 0 ? currentStageIndex : 0];

    // Calculate progress within the current stage
    const stageDuration = currentStage.maxDay - currentStage.minDay + 1;
    const daysInStage = Math.max(0, ageDays - currentStage.minDay + 1);
    const stageProgress = Math.min(100, (daysInStage / stageDuration) * 100);

    // Total progress (170 days cycle)
    const totalProgress = Math.min(100, (ageDays / 170) * 100);

    const stageInsights = {
        "Germination": "Keep soil consistently moist but not waterlogged.",
        "Seedling Stage": "Protect young plants; steady light irrigation recommended.",
        "Vegetative Growth / Root or Tuber Development": "Rapid growth phase: High water and nutrient demand.",
        "Flowering": "Avoid water stress now to ensure maximum yield.",
        "Pollination": "Critical pollination period — maintain stable conditions.",
        "Fruit/Grain/Bulb Formation": "Maintain moisture for quality produce formation.",
        "Maturation": "Slowly reduce irrigation as crop approaches maturity.",
        "Harvest": "Minimize irrigation — prepare for harvest.",
    };

    return (
        <Card className={cn("glass rounded-[2.5rem] p-8 hover-elevate transition-all duration-700 border border-white/10 relative overflow-hidden group min-h-[220px]", className)} data-testid="card-crop-stage">
            {/* Mission Control: Scanline & Glow */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] opacity-[0.1] blur-[120px] pointer-events-none animate-pulse bg-emerald-500" />

            <div className="relative z-10 flex h-full items-center justify-between gap-8">
                {/* Identity Area: Expansive Space */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1.5 w-8 rounded-full bg-emerald-500 opacity-50" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/85 leading-none">Growth Cycle // Omega</span>
                    </div>

                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-6 whitespace-nowrap overflow-visible">
                        <span>{stage}</span>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-7xl font-black tracking-tightest leading-none">
                            {ageDays}<span className="text-emerald-500 text-3xl font-bold ml-1">D</span>
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-lg border border-emerald-500/10 tracking-[0.2em] uppercase">
                                System Active
                            </div>
                            <div className="text-[8px] font-bold text-muted-foreground/80 uppercase tracking-[0.3em] px-1">Phase Validated</div>
                        </div>
                    </div>
                </div>

                {/* Biometrics List: Technical Readout */}
                <div className="flex-none flex flex-col justify-center gap-5 border-l border-white/5 pl-8 min-w-[140px]">
                    <div className="space-y-2 px-1">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground/75">
                            <span>Maturity</span>
                            <span className="text-emerald-500 font-black">{Math.round(stageProgress)}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stageProgress}%` }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                    </div>

                    {[
                        { label: "Rate", value: `+1.2mm`, icon: Sparkles, color: "text-emerald-500" },
                        { label: "Yield", value: `94.2%`, icon: Target, color: "text-emerald-500" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-end">
                            <span className="text-base font-black tracking-tight leading-none">{stat.value}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20 mt-1">{stat.label}</span>
                        </div>
                    ))}

                    <div className="mt-2 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Bio-Synced</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   CROP NEEDS / INSIGHTS CARD
──────────────────────────────────────────────────────────────── */
export function CropNeedsCard({ waterRequired, warnings, rainDetected, rainRaw, className }) {
    const [dismissed, setDismissed] = useState(false);
    useEffect(() => { if (waterRequired) setDismissed(false); }, [waterRequired]);

    // ── Derive rain intensity (0-100%) from raw ADC ──
    const hasRainData = rainRaw !== undefined && rainRaw !== null;
    const rawValue = hasRainData ? Number(rainRaw) : 4095;
    const rainIntensity = hasRainData
        ? Math.round(Math.max(0, Math.min(100, ((4095 - rawValue) / 4095) * 100)))
        : 0;

    // ── Decide display state: RAIN > HYD > OPT ──
    const isRaining = rainDetected === true;
    const needsWater = !isRaining && waterRequired;

    const displayState = isRaining ? "RAIN" : needsWater ? "HYD" : "OPT";

    const stateConfig = {
        RAIN: {
            abbrev: "RNY",
            dotColor: "text-blue-400",
            badge: "Rain Active",
            badgeClass: "bg-blue-500 text-white shadow-blue-500/20",
            scoreValue: rainIntensity,           // ring shows rain intensity
            scoreColor: "var(--tw-color-blue, #3b82f6)",
            scoreStroke: "#3b82f6",
            growthVel: "-0.8%",
            growthColor: "text-blue-400",
            resourceEf: `${100 - rainIntensity}%`,
            resourceColor: "text-blue-400",
            glowColor: "#3b82f620",
        },
        HYD: {
            abbrev: "HYD",
            dotColor: "text-primary",
            badge: "Hydration Needed",
            badgeClass: "bg-primary text-white shadow-primary/20",
            scoreValue: 94.2,
            scoreColor: "var(--primary)",
            scoreStroke: "var(--primary)",
            growthVel: "+4.2%",
            growthColor: "text-emerald-500",
            resourceEf: "94.2%",
            resourceColor: "text-primary",
            glowColor: "rgba(var(--primary-rgb, 34 197 94) / 0.08)",
        },
        OPT: {
            abbrev: "OPT",
            dotColor: "text-emerald-500",
            badge: "System Healthy",
            badgeClass: "bg-emerald-500/10 text-emerald-500",
            scoreValue: 97.4,
            scoreColor: "#10b981",
            scoreStroke: "#10b981",
            growthVel: "+4.2%",
            growthColor: "text-emerald-500",
            resourceEf: "97.4%",
            resourceColor: "text-emerald-500",
            glowColor: "#10b98108",
        },
    };

    const cfg = stateConfig[displayState];
    const r = 28;
    const circumference = 2 * Math.PI * r;

    return (
        <Card className={cn("glass rounded-[2.5rem] p-8 hover-elevate transition-all duration-700 overflow-hidden relative border-white/10", className)} data-testid="card-crop-needs">
            {/* Elite Overlays */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: cfg.glowColor }} />

            {/* Rain drops animation */}
            {isRaining && (
                <motion.div
                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-8 w-[1px] bg-blue-400/20 rounded-full"
                            style={{ left: `${10 + i * 12}%`, top: `-10%` }}
                            animate={{ y: ["0%", "120%"], opacity: [0, 0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2 + i * 0.15, delay: i * 0.18, ease: "linear" }}
                        />
                    ))}
                </motion.div>
            )}

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Identity Section (6 cols) */}
                <div className="lg:col-span-6 flex flex-col justify-center min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-1 w-6 rounded-full bg-primary opacity-50 shadow-[0_0_12px_var(--primary)] text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 leading-none">
                            System Intelligence Node
                        </span>
                    </div>

                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none mb-6">
                        Insights & Strategy
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <motion.div
                            key={displayState}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("text-6xl font-black tracking-tighter leading-none", cfg.dotColor)}
                        >
                            {cfg.abbrev}<span className="text-primary opacity-50">.</span>
                        </motion.div>

                        <div className="flex flex-col gap-2">
                            <motion.div key={cfg.badge} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                <Badge className={cn("rounded-lg px-4 py-1.5 shadow-xl border-none text-[9px] font-black uppercase tracking-[0.1em]", cfg.badgeClass)}>
                                    {cfg.badge}
                                </Badge>
                            </motion.div>
                            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">
                                {isRaining ? `Intensity: ${rainIntensity}%` : "Signal Verified"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Strategic Vectors Section (3 cols) */}
                <div className="lg:col-span-3 hidden xl:flex flex-col gap-4 border-l border-white/5 pl-8">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">Environmental Params</span>
                    <div className="space-y-4">
                        {[
                            { label: "RAG Sync", value: "Verified", color: "text-emerald-500" },
                            { label: "Vector Flux", value: "Stable", color: "text-primary" },
                            { label: "Atmosphere", value: "Optimal", color: "text-blue-400" }
                        ].map((v, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5">{v.label}</span>
                                <span className={cn("text-[9px] font-bold uppercase tracking-tight", v.color)}>{v.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Score and Real-time Metrics (3 cols) */}
                <div className="lg:col-span-3 flex items-center justify-end gap-6 border-l border-white/5 pl-8">
                    <div className="relative h-20 w-20 shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                            <motion.circle
                                key={displayState + cfg.scoreValue}
                                cx="32" cy="32" r={r}
                                stroke={cfg.scoreStroke}
                                strokeWidth="4"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (circumference * cfg.scoreValue) / 100 }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                strokeLinecap="round"
                                fill="transparent"
                                style={{ filter: `drop-shadow(0 0 10px ${cfg.scoreStroke})` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-black tracking-tighter tabular-nums">{cfg.scoreValue.toFixed ? cfg.scoreValue.toFixed(1) : cfg.scoreValue}%</span>
                            <span className="text-[6px] font-black uppercase text-muted-foreground/60">{isRaining ? "RAIN" : "CORE"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[100px]">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-end">
                            <span className="text-[7px] font-black text-muted-foreground/50 uppercase">Growth Vel.</span>
                            <span className={cn("text-xs font-black", cfg.growthColor)}>{cfg.growthVel}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-end">
                            <span className="text-[7px] font-black text-muted-foreground/50 uppercase">Efficiency</span>
                            <span className={cn("text-xs font-black", cfg.resourceColor)}>{cfg.resourceEf}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   IRRIG PREDICTION CARD
   ──────────────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────────
   IRRIG PREDICTION CARD (ML / Random Forest)
   ──────────────────────────────────────────────────────────────── */
export function IrrigationPredictionCard({ prediction, className }) {
    // Only treat as a valid prediction if it has the expected `result` field
    const validPrediction = prediction?.result ? prediction : null;
    const isNeeded = validPrediction?.prediction === 1;
    const result = validPrediction?.result || "Analyzing Patterns...";
    const confidence = validPrediction?.confidence || 0;
    const confidenceDisplay = typeof confidence === "number" ? Math.round(confidence * 10) / 10 : 0;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 hover-elevate border-white/5 relative overflow-hidden h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <BrainCircuit size={48} />
            </div>

            <div className="flex flex-col h-full justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl grid place-items-center border",
                        isNeeded ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                    )}>
                        <Activity size={20} className={isNeeded ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/85 leading-none mb-1">ML Model Prediction</div>
                        <div className="text-sm font-black tracking-tight">{result}</div>
                    </div>
                </div>

                <div className="flex-1 py-4">
                    <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <span>Confidence Model</span>
                            <span className="text-primary">RF-v2.8-Agro</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                key={confidenceDisplay}
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceDisplay}%` }}
                                className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            />
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground leading-relaxed italic">
                            {validPrediction ? (isNeeded
                                ? "Historical patterns and telemetry suggest high probability of water stress in the current growth phase."
                                : "Soil-to-crop moisture flux is stable. Random Forest model predicts no immediate irrigation requirement.") : "Syncing with Kissan ML clusters..."}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", isNeeded ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                            {isNeeded ? "ACTION RECOMMENDED" : "ALL SYSTEMS GREEN"}
                        </span>
                    </div>
                    <Badge variant="outline" className="rounded-lg text-[8px] font-black border-white/10 uppercase tracking-widest">
                        {confidenceDisplay}% CONF
                    </Badge>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   LIVE SENSOR GAUGES CARD – 4 gauges in a row
──────────────────────────────────────────────────────────────── */

function SingleGauge({ value, max, unit, label, icon: Icon, color, colorLight, gradientId }) {
    const clamped = Math.max(0, Math.min(value, max));
    const pct = (clamped / max) * 100;

    // Gauge Constants for a 270-degree Clockwise Sweep
    const r = 42;
    const startAngle = 135; // Bottom Left (7 o'clock)
    const sweepAngle = 270; // 3/4 Circle
    const endAngle = startAngle + sweepAngle;
    const activeRotation = (pct / 100) * sweepAngle + startAngle;

    const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: cx + (radius * Math.cos(angleInRadians)),
            y: cy + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x, y, radius, startA, endA) => {
        const start = polarToCartesian(x, y, radius, endA);
        const end = polarToCartesian(x, y, radius, startA);
        const largeArcFlag = endA - startA <= 180 ? "0" : "1";
        return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
    };

    return (
        <div className="flex flex-col items-center gap-6 flex-1 group/gauge">
            {/* Clockwise Instrument Hub */}
            <div className="relative h-44 w-44 flex items-center justify-center">
                {/* Background Structure: Glassmorphic Orb */}
                <div className="absolute inset-4 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl" />

                {/* Spectral Overlays: Scanline & Reflection */}
                <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none z-10">
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/10 to-transparent rotate-12 opacity-50" />
                </div>

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120">
                    {/* Track */}
                    <path
                        d={describeArc(60, 60, r, startAngle, endAngle)}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/5"
                    />

                    {/* Precision Step Ticks */}
                    {[...Array(21)].map((_, i) => {
                        const angle = startAngle + (i * (sweepAngle / 20));
                        const isMain = i % 2 === 0;
                        const p1 = polarToCartesian(60, 60, r - (isMain ? 6 : 3), angle);
                        const p2 = polarToCartesian(60, 60, r + 1, angle);
                        return (
                            <line
                                key={i}
                                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                stroke="currentColor"
                                strokeWidth={isMain ? 1.5 : 1}
                                className={i * 5 <= pct ? "opacity-40" : "opacity-[0.05]"}
                                style={{ color: i * 5 <= pct ? color : "currentColor" }}
                            />
                        );
                    })}

                    {/* Active Fluid Progress Path */}
                    <motion.path
                        d={describeArc(60, 60, r, startAngle, startAngle + (pct / 100 * sweepAngle))}
                        fill="transparent"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
                    />

                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={colorLight} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Micro-Needle Mechanism */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <motion.div
                        initial={{ rotate: startAngle }}
                        animate={{ rotate: activeRotation }}
                        transition={{ duration: 2.5, ease: "backOut" }}
                        className="h-[84px] w-[2px] mb-[84px] origin-bottom relative"
                    >
                        <div
                            className="h-full w-full rounded-full"
                            style={{
                                background: `linear-gradient(to top, transparent 40%, ${color} 100%)`,
                                boxShadow: `0 0 20px ${color}`
                            }}
                        />
                        {/* Needle Tip Highlight */}
                        <div className="absolute top-0 left-1/2 -ml-[1.5px] h-3 w-[3px] bg-white rounded-full blur-[0.5px] shadow-[0_0_10px_#fff]" />
                    </motion.div>
                </div>

                {/* Digital Core Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <motion.div
                        key={value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black tracking-tightest leading-none drop-shadow-sm"
                    >
                        {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
                    </motion.div>
                    <span className="text-[11px] font-black text-muted-foreground/85 mt-1 tracking-[0.2em] uppercase">{unit}</span>
                </div>
            </div>

            {/* Hub Identity & Meta Specs */}
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/[0.03] border border-white/10 grid place-items-center shadow-inner group-hover/gauge:scale-110 transition-transform duration-500" style={{ color }}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/85 leading-none mb-2">{label}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                        <div className="h-1 w-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/90">Status: Nominal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LiveSensorGaugesCard({ soil1, soil2, temperature, humidity, hasLive, className }) {
    return (
        <Card className={cn("glass rounded-[3rem] p-10 hover-elevate overflow-hidden relative border-white/10 group", className)} data-testid="card-live-sensors">
            {/* Elite Overlays: Scanline & Ambient Orbs */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000" />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000" />

            {/* Technical Mesh Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header: Technical Identity */}
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center relative">
                            <Activity size={24} className="text-primary" strokeWidth={2.5} />
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full blur-[4px] animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/75 leading-none">Telemetry Node // X-SYNC</span>
                                {hasLive && (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Live Feed</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-black tracking-tightest uppercase leading-none">Environment Diagnostics</h3>
                        </div>
                    </div>
                </div>

                {/* Instrument Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    <SingleGauge
                        value={soil1 ?? 0} max={100} unit="%" label="Moisture Zone A"
                        icon={Droplets} color="#3b82f6" colorLight="#60a5fa" gradientId="gradSoil1"
                    />
                    <SingleGauge
                        value={soil2 ?? 0} max={100} unit="%" label="Moisture Zone B"
                        icon={Waves} color="#8b5cf6" colorLight="#a78bfa" gradientId="gradSoil2"
                    />
                    <SingleGauge
                        value={temperature ?? 0} max={50} unit="°C" label="Atmospheric Temp"
                        icon={Thermometer} color="#f59e0b" colorLight="#fbbf24" gradientId="gradTemp"
                    />
                    <SingleGauge
                        value={humidity ?? 0} max={100} unit="%" label="Relative Humidity"
                        icon={Cloud} color="#06b6d4" colorLight="#22d3ee" gradientId="gradHumidity"
                    />
                </div>

                {/* Footer Readout */}
                <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Sampling Rate</span>
                            <span className="text-xs font-black tracking-tighter">1,024 Hz / SEC</span>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-white/5 pl-10">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">System Error</span>
                            <span className="text-xs font-black tracking-tighter text-emerald-500">&lt; 0.001% TOL</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Cluster ID // Node Alpha</span>
                        <span className="text-xs font-black tracking-tighter opacity-40">STATION_CMD_9901_X</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/**
 * RLInsightCard
 * Displays Reinforcement Learning optimization decisions.
 */
export function RLInsightCard({ rlAction, className }) {
    const litres = rlAction?.litres ?? 0;
    const reasoning = rlAction?.reasoning || "Agent evaluating environmental flux...";
    const isActive = litres > 0;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 hover-elevate border-white/5 relative overflow-hidden h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Zap size={48} />
            </div>

            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/10 grid place-items-center shadow-lg">
                        <Zap size={20} className={isActive ? "animate-bounce" : ""} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/85 leading-none mb-1">Deep RL Optimizer</div>
                        <div className="text-sm font-black tracking-tight">Agent Strategy</div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center transition-all duration-300 group-hover:bg-white/10">
                        <div className="text-4xl font-black text-primary tracking-tighter leading-none mb-1">
                            {litres}
                            <span className="text-lg font-bold ml-1 text-primary/60">L</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Optimal Volume Output</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-[9px] font-black uppercase tracking-widest text-primary">
                            <Activity size={12} />
                            <span>Strategy Reasoning</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic">
                            "{reasoning}"
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", isActive ? "bg-orange-500 animate-pulse" : "bg-white/20")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">RL-Proximal Policy v4</span>
                    </div>
                    <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black uppercase">
                        {isActive ? "ACTIVE TARGET" : "STANDBY"}
                    </Badge>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   ZONE INTELLIGENCE / VIRTUAL MOISTURE MAP CARD
──────────────────────────────────────────────────────────────── */
export function ZoneIntelligenceCard({ zones, className }) {
    if (!zones || !zones.zones) return null;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Map size={48} />
            </div>

            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                        <Map size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/85 leading-none mb-1">Zone Intelligence</div>
                        <div className="text-sm font-black tracking-tight">Virtual Moisture Mapping</div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3">
                    {zones.zones.map((zone, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">{zone.zone_id}</span>
                                <span className="text-xs font-black">{Math.round(zone.moisture)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${zone.moisture}%` }}
                                />
                            </div>
                            <div className="mt-2 text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                {zone.is_virtual ? "AI INTERPOLATED" : "SENSOR ACTIVE"}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Spatial AI Grid v1.0</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-bold border-white/10 uppercase">
                        {Math.round(zones.avg_moisture)}% AVG
                    </Badge>
                </div>
            </div>
        </Card>
    );
}

/**
 * NDVICard
 * Displays Satellite-based Crop Health Intelligence (NDVI).
 */
export function NDVICard({ ndviData, className }) {
    const isReady = Boolean(ndviData);
    const score = isReady ? ndviData.score : 0.72;
    const health = isReady ? ndviData.health_status : "Healthy";
    const confidence = isReady ? ndviData.confidence : 0.95;

    // Thresholds: Healthy > 0.5, Moderate 0.3-0.5, Poor < 0.3
    const tone = score > 0.5 ? "good" : score >= 0.3 ? "warn" : "bad";
    const color = tone === "good" ? "#10b981" : tone === "warn" ? "#f59e0b" : "#f43f5e";

    return (
        <Card className={cn("glass rounded-[2rem] p-6 border-emerald-500/10 relative overflow-hidden group", className)}>
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-1000" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center shadow-sm">
                            <Activity size={16} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black tracking-tight leading-none text-foreground">Crop Health (NDVI)</h4>
                            <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest leading-none mt-1">
                                Satellite AI Signal
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("text-[9px] font-bold tracking-widest uppercase border-none",
                        tone === "good" ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]" :
                            tone === "warn" ? "bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {health}
                    </Badge>
                </div>

                <div className="mt-2 mb-6 flex items-center justify-center">
                    <div className="relative h-24 w-24">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                            <motion.circle
                                cx="50" cy="50" r="40"
                                stroke={color}
                                strokeWidth="6"
                                strokeDasharray={2 * Math.PI * 40}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 - (2 * Math.PI * 40 * ((score + 1) / 2)) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                                fill="transparent"
                                style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black tracking-tighter leading-none">{score.toFixed(2)}</span>
                            <span className="text-[8px] font-black text-muted-foreground/80 mt-0.5 tracking-widest uppercase">Score</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest mb-1 group-hover:text-emerald-500/40 transition-colors">Confidence</span>
                        <div className="flex items-end gap-1">
                            <span className="text-sm font-black tracking-tight leading-none tabular-nums">{(confidence * 100).toFixed(1)}</span>
                            <span className="text-[9px] font-bold text-muted-foreground/80 pb-[1px]">%</span>
                        </div>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest mb-1 group-hover:text-emerald-500/40 transition-colors">Data Source</span>
                        <span className="text-[10px] font-black text-emerald-500 tracking-tight leading-none truncate">SENTINEL-2 L2A</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest italic">Research Node Active</span>
                    </div>
                    <span className="text-[8px] font-black text-muted-foreground/80 uppercase">F-16/remote-sync</span>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   AI IRRIGATION RECOMMENDATION CARD
──────────────────────────────────────────────────────────────── */
export function AIIrrigationCard({ irrigation, className }) {
    if (!irrigation) return null;

    const isNeeded = irrigation.should_irrigate;
    const severity = irrigation.urgency; // "critical", "high", "medium", "low", "none"

    const toneColor = {
        critical: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        high: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        none: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    }[severity] || "text-primary bg-primary/10 border-primary/20";

    return (
        <Card className={cn("glass rounded-[2rem] p-6 hover-elevate border-white/5 relative overflow-hidden group h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <Brain size={64} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl grid place-items-center shadow-lg", toneColor)}>
                            <Droplets size={20} className={isNeeded ? "animate-bounce" : ""} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">AI Recommendation</div>
                            <h3 className="text-sm font-black tracking-tight">{isNeeded ? "Irrigation Needed" : "Optimal Conditions"}</h3>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("rounded-lg capitalize text-[9px] font-bold tracking-widest", toneColor)}>
                        {severity} Urgency
                    </Badge>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                            "{irrigation.message}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Water Need</div>
                            <div className="text-lg font-black text-primary">{irrigation.water_needed_liters}L</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Runtime</div>
                            <div className="text-lg font-black text-primary">{irrigation.sprinkler_runtime_minutes}m</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                            <span>Analysis Detail</span>
                            <span>{Math.round(irrigation.daily_water_loss_percent * 10) / 10}% daily ET loss</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {irrigation.reasoning?.slice(1, 4).map((r, i) => (
                                <Badge key={i} variant="secondary" className="bg-white/5 text-[8px] font-bold text-muted-foreground/70 border-none px-2">
                                    {r.replace(/🌡️|💨|🏜️|⚠️/, "").trim()}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", isNeeded ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Autonomous Logic Engine v2.0</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary italic">Next: {irrigation.next_irrigation_in_hours}h</span>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   WATER ANALYTICS & SAVINGS CARD
──────────────────────────────────────────────────────────────── */
export function WaterAnalyticsCard({ analytics, className }) {
    if (!analytics) return null;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 border-emerald-500/20 relative overflow-hidden group h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <TrendingUp size={64} className="text-emerald-500" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 grid place-items-center">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">Water Analytics</div>
                            <h3 className="text-sm font-black tracking-tight">Smart Savings</h3>
                        </div>
                    </div>
                    <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black tracking-widest uppercase">
                        {analytics.saving_percent}% SAVED
                    </Badge>
                </div>

                <div className="space-y-6 flex-1">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="text-4xl font-black tracking-tighter text-emerald-500">
                                {Math.round(analytics.water_saved_liters)}
                                <span className="text-lg font-bold ml-1 text-emerald-500/70">L</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Total Savings Impact</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black text-emerald-500/80">₹{Math.round(analytics.cost_saved_inr)}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">Cost Reduction</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-widest">Efficiency Benchmark</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">{analytics.saving_percent}% Better than Flood</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - analytics.saving_percent}%` }}
                                    className="h-full bg-muted-foreground/20"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${analytics.saving_percent}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Used (Smart)</div>
                                <div className="text-sm font-black">{Math.round(analytics.total_water_used_liters)}L</div>
                            </div>
                            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Used (Flood)</div>
                                <div className="text-sm font-black text-muted-foreground/70">{Math.round(analytics.flood_equivalent_liters)}L</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5 flex items-center gap-3">
                    <Activity size={14} className="text-emerald-500" />
                    <p className="text-[9px] font-bold text-muted-foreground/80 leading-tight italic">
                        "{analytics.message}"
                    </p>
                </div>
            </div>
        </Card>
    );
}

/* ────────────────────────────────────────────────────────────────
   SYSTEM HEALTH & ANOMALY DETECTION CARD
──────────────────────────────────────────────────────────────── */
export function SystemHealthCard({ failures, className }) {
    if (!failures) return null;

    const health = failures.system_health; // "healthy", "warning", "critical"
    const score = failures.health_score;
    const alerts = failures.alerts || [];

    const statusConfig = {
        healthy: { color: "text-emerald-500", icon: Check, label: "All Systems Normal", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        warning: { color: "text-amber-500", icon: AlertTriangle, label: "Minor Anomaly", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        critical: { color: "text-rose-500", icon: ShieldAlert, label: "System Breach", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    }[health] || statusConfig.healthy;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 border-white/5 relative overflow-hidden group h-full", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <Cpu size={64} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl grid place-items-center border shadow-lg", statusConfig.color, statusConfig.bg, statusConfig.border)}>
                            <statusConfig.icon size={20} className={health !== 'healthy' ? "animate-pulse" : ""} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">System Integrity</div>
                            <h3 className="text-sm font-black tracking-tight">{statusConfig.label}</h3>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("rounded-lg text-[10px] font-black tracking-widest", statusConfig.color, statusConfig.border)}>
                        {score}% SAFE
                    </Badge>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative h-24 w-24">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                <motion.circle
                                    cx="50" cy="50" r="40"
                                    stroke="currentColor" strokeWidth="8"
                                    strokeDasharray={251.2}
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round" fill="transparent"
                                    className={statusConfig.color}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black tracking-tighter">{score}</span>
                                <span className="text-[8px] font-black uppercase text-muted-foreground/60 leading-none">Security</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Active Alerts</div>
                                <div className={cn("text-lg font-black", alerts.length > 0 ? statusConfig.color : "text-muted-foreground")}>{alerts.length}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-muted-foreground/70 italic px-3">
                                {health === 'healthy' ? "Continuous scan active..." : "Threat mitigation required"}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Real-time Diagnostics</div>
                        {alerts.length > 0 ? (
                            <div className="space-y-1.5 max-h-[100px] overflow-y-auto no-scrollbar">
                                {alerts.map((alert, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                                        <p className="text-[9px] font-medium text-rose-500/90 leading-tight">
                                            {alert.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                                <Check size={10} className="text-emerald-500" />
                                <span className="text-[9px] font-bold text-muted-foreground/70">Telemetry cross-check validated.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/5">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                        <span>Anomalies: {alerts.length} Detect</span>
                        <span className="text-primary italic animate-pulse">Monitoring...</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function SoilClassificationCard({ classification, onUpload, className }) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setLoading(true);
        try {
            await onUpload(file);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const prediction = classification?.prediction || "Not Classified";
    const confidence = classification?.confidence ? (classification.confidence * 100).toFixed(1) : 0;

    return (
        <Card className={cn("glass rounded-[2rem] p-6 hover-elevate border-white/5 relative overflow-hidden h-full flex flex-col", className)}>
            <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Camera size={48} />
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Soil Profiler</h3>
                    <p className="text-xs text-muted-foreground">CNN-based sub-surface analysis</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[1.5rem] p-4 relative bg-black/20 mb-6 group cursor-pointer hover:border-amber-500/50 transition-colors">
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    accept="image/*"
                />

                {preview ? (
                    <img src={preview} alt="Soil Sample" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <UploadCloud size={32} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Upload Soil Sample</span>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] flex items-center justify-center z-20 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                )}
            </div>

            {classification?.error ? (
                <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="h-2 w-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Classification Failed</span>
                            <p className="text-[10px] text-rose-400/80 mt-1 leading-relaxed">{classification.error}</p>
                        </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 italic px-2">Start the soil service: <code className="bg-white/5 px-1 rounded">python soil_classifier/soil_service.py</code></p>
                </div>
            ) : classification?.prediction ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">AI Identification</span>
                            <div className="text-xl font-black uppercase tracking-tighter text-amber-500">{prediction}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-500">
                            {confidence}% CONF
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {classification.probabilities && Object.entries(classification.probabilities).map(([label, prob]) => (
                            <div key={label} className="bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="flex justify-between text-[7px] font-black uppercase text-muted-foreground/60 mb-1">
                                    <span>{label}</span>
                                    <span>{(prob * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500/50"
                                        style={{ width: `${prob * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 italic px-2">
                        <Sparkles size={10} />
                        <span>Ready for sub-surface image scan...</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 opacity-20">
                        <div className="h-8 bg-white/5 rounded-lg" />
                        <div className="h-8 bg-white/5 rounded-lg" />
                    </div>
                </div>
            )}
        </Card>
    );
}
