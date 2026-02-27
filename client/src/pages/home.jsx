import { useEffect } from "react";
import Shell from "@/components/agro/shell";
import { useApp } from "@/context/app-context";
import { calculateWheatStage, decisionEngine } from "@/lib/agro";
import {
    CropNeedsCard,
    CropStageCard,
    RainSensorCard,
    LiveSensorGaugesCard,
    WeatherCard,
    RLInsightCard,
    NDVICard,
    IrrigationPredictionCard,
    AIIrrigationCard,
    WaterAnalyticsCard,
    SystemHealthCard,
    ZoneIntelligenceCard,
    SoilClassificationCard,
} from "@/components/agro/cards";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Home() {
    const { state, actions } = useApp();
    const time = new Date().getHours();
    const greeting = time < 12 ? "Good Morning" : time < 17 ? "Good Afternoon" : "Good Evening";

    const stage = calculateWheatStage(state.cropAgeDays);

    const sensor = state.liveSensor;
    const hasLive = Boolean(sensor);
    const isLiveConnected = state.mqttStatus === "connected";

    // Always use canonical values from state (updated by socket, fallback to weather)
    const soilMoisture = state.soilMoisture;
    const rainDetected = state.rainDetected;

    // Individual sensor values for gauges — live first, then weather API, never hardcoded
    const soil1 = sensor?.soil1_moisture ?? soilMoisture;
    const soil2 = sensor?.soil2_moisture ?? soilMoisture;
    const temperature = sensor?.temperature ?? state.weather?.tempC ?? 0;
    const humidity = sensor?.humidity ?? state.weather?.humidity ?? 0;
    const rainRaw = sensor?.rain_raw ?? null;

    const decisions = decisionEngine({
        soilMoisture,
        rainDetected,
        nutrientLow: false,
    });

    // Automatically trigger ML prediction on load and when sensor data updates
    useEffect(() => {
        const timer = setTimeout(() => {
            actions.getPrediction();
        }, 800); // Small debounce — runs on mount AND whenever key values change
        return () => clearTimeout(timer);
    }, [soilMoisture, temperature, humidity, state.cropType, state.soilType, state.cropStage]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <Shell
            title="Farm Overview"
            subtitle={`${greeting}${state.user ? `, ${state.user.name}` : ''}! Here's what's happening on your farm today.`}
        >
            <div className="flex justify-end mb-4">
                <button
                    onClick={actions.simulateData}
                    className="group relative px-4 py-1.5 rounded-full overflow-hidden transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                    <div className="absolute inset-0 border border-primary/20 rounded-full" />
                    <div className="relative flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Activity size={12} className="animate-pulse" />
                        <span>Run Diagnostic Simulation</span>
                    </div>
                </button>
            </div>
            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ─── ROW 1: 4 Sensor Gauges (full width, standalone) ─── */}
                <motion.div variants={itemVariants}>
                    <LiveSensorGaugesCard
                        soil1={soil1}
                        soil2={soil2}
                        temperature={temperature}
                        humidity={humidity}
                        hasLive={hasLive}
                        className="w-full"
                    />
                </motion.div>

                {/* ─── AI INTELLIGENCE ENGINE ─── */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/90">
                            AI Intelligence Engine
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AIIrrigationCard irrigation={state.intelligenceEngine?.irrigation} />
                        <WaterAnalyticsCard analytics={state.intelligenceEngine?.waterAnalytics} />
                        <SystemHealthCard failures={state.intelligenceEngine?.failures} />
                        <ZoneIntelligenceCard zones={state.intelligenceEngine?.zones} />
                    </div>
                </motion.div>

                {/* ─── ROW 2: Crop & Environment ─── */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/85">
                            Crop & Environment
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CropStageCard stage={state.cropStage || stage.name} ageDays={state.cropAgeDays} className="h-full" />
                        <WeatherCard
                            location={state.weather.locationName}
                            locationCoords={state.locationCoords}
                            cityName={state.cityName}
                            tempC={state.weather.tempC}
                            condition={state.weather.condition}
                            humidity={state.weather.humidity}
                            windKph={state.weather.windKph}
                            rainChance={state.weather.rainChance}
                            onLocationChange={actions.setLocation}
                            className="h-full"
                        />
                    </div>
                </motion.div>

                {/* ─── ROW 3: Predictive Models ─── */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/85">
                            AI Decision Models
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <RLInsightCard rlAction={state.intelligenceEngine?.rlAction || state.rlAction} className="h-full" />
                        <IrrigationPredictionCard prediction={state.intelligenceEngine?.mlPrediction || state.irrigationPrediction} className="h-full" />
                        <NDVICard ndviData={state.ndviData} className="h-full" />
                        <SoilClassificationCard
                            classification={state.soilClassification}
                            onUpload={actions.classifySoil}
                            className="h-full"
                        />
                    </div>
                </motion.div>

                {/* ─── ROW 4: Weather & Shield ─── */}
                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RainSensorCard
                            rainDetected={rainDetected}
                            rainRaw={rainRaw}
                            className="h-full"
                        />
                        <CropNeedsCard
                            waterRequired={decisions.waterRequired}
                            warnings={decisions.warnings}
                            rainDetected={rainDetected}
                            rainRaw={rainRaw}
                            className="h-full"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </Shell>
    );
}
