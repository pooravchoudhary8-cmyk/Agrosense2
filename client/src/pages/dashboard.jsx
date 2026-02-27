import React, { useState, useEffect } from "react";
import {
  BatteryCharging,
  BatteryFull,
  Power,
  Zap,
  Activity,
  Wind,
  Thermometer,
  Droplet,
  Settings,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendPumpStatus } from "@/lib/pumpApi";
import Shell from "@/components/agro/shell";
import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch as Toggle } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* ---------------- HELPERS ---------------- */

function batteryTone(level) {
  if (level <= 20) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  if (level <= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
}

/* ---------------- SUB-COMPONENTS ---------------- */

const MetricRing = ({ value, label, color, icon: Icon, unit = "%" }) => {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24 group">
        <svg className="h-full w-full -rotate-90 transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/10" />
          <motion.circle
            cx="50" cy="50" r={r}
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={14} className="text-muted-foreground/80 mb-0.5" />
          <span className="text-lg font-black tracking-tighter leading-none">{Math.round(value)}{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</span>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function Dashboard() {
  const { state, actions } = useApp();
  const sensor = state.liveSensor;
  const hasLive = Boolean(sensor);
  const isLiveConnected = state.mqttStatus === "connected";

  // ─── Solar Power — local random simulation ────────────────────────────────
  // Simulates a real solar panel system: battery charges during the day,
  // voltage and wattage fluctuate realistically with small random drifts.
  const [solar, setSolar] = useState({
    batteryPct: 72,
    voltage: 13.2,
    wattage: 48,
    panelPct: 84,
    charging: true,
  });

  useEffect(() => {
    const drift = (val, min, max, step) => {
      const delta = (Math.random() - 0.48) * step;  // Slight upward bias = charging
      return Math.round(Math.min(max, Math.max(min, val + delta)) * 10) / 10;
    };

    const timer = setInterval(() => {
      setSolar(prev => {
        const nextBattery = drift(prev.batteryPct, 40, 99, 1.2);
        const nextVoltage = drift(prev.voltage, 11.8, 14.5, 0.2);
        const nextWattage = drift(prev.wattage, 20, 90, 4);
        const nextPanel = drift(prev.panelPct, 65, 99, 2);
        return {
          batteryPct: nextBattery,
          voltage: nextVoltage,
          wattage: Math.round(nextWattage),
          panelPct: Math.round(nextPanel),
          charging: nextBattery < 98,
        };
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);
  // ───────────────────────────────────────────────────────────────

  // Always use live sensor values when available, fall back to weather/state
  const soilMoisture = state.soilMoisture;
  const temperature = sensor?.temperature ?? state.weather?.tempC ?? 0;
  const humidity = sensor?.humidity ?? state.weather?.humidity ?? 0;
  const batteryLevel = solar.batteryPct;   // use solar simulation

  // Calculative Metrics
  const isRaining = state.rainDetected;
  const irrigationRequired = soilMoisture < 30 && !isRaining;
  const pumpOn = state.pumpMode === "AUTO" ? irrigationRequired : state.pumpOn;

  // Derived Health Status
  const healthStatus =
    isRaining ? "RAINING" :
      soilMoisture < 15 ? "CRITICAL" :
        soilMoisture < 30 ? "LOW" :
          soilMoisture > 85 ? "SATURATED" : "OPTIMAL";

  const healthColor =
    isRaining ? "text-blue-500" :
      healthStatus === "CRITICAL" ? "text-rose-500" :
        healthStatus === "LOW" ? "text-amber-500" :
          healthStatus === "SATURATED" ? "text-blue-500" : "text-emerald-500";

  // Calculative Efficiency (Diminishes with high temp or low battery)
  const thermalLoss = Math.max(0, (temperature - 25) * 0.2);
  const calculatedEfficiency = (98.5 - thermalLoss - (100 - batteryLevel) * 0.05).toFixed(1);

  // Handler: user switches between AUTO and MANUAL mode
  const handleSetMode = (newMode) => {
    // ✅ Optimistic update — UI responds instantly
    actions.setPumpMode(newMode);
    const effectivePumpOn = newMode === "AUTO" ? irrigationRequired : state.pumpOn;

    sendPumpStatus({
      pumpOn: effectivePumpOn,
      mode: newMode,
      reason: newMode === "AUTO"
        ? (irrigationRequired ? "Moisture below 30%" : "Optimal Levels")
        : "Manual Command",
    }).catch((err) => {
      // Revert on failure
      console.error("Pump mode update error — reverting:", err);
      actions.setPumpMode(state.pumpMode);
    });
  };

  // Handler: user manually toggles pump ON/OFF
  const handleManualToggle = (val) => {
    // ✅ Optimistic update — toggle flips instantly, no waiting for HTTP
    actions.setPumpOn(val);

    sendPumpStatus({
      pumpOn: val,
      mode: "MANUAL",
      reason: val ? "Manual ON" : "Manual OFF",
    }).catch((err) => {
      // Revert toggle on failure
      console.error("Pump toggle error — reverting:", err);
      actions.setPumpOn(!val);
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
  };

  return (
    <Shell
      title="System Command"
      subtitle="Centralized management of farm automation and power resources."
    >
      <motion.div
        className="grid lg:grid-cols-12 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── SYSTEM STATUS STRIP ─── */}
        <motion.div variants={cardVariants} className="lg:col-span-12 flex flex-wrap gap-4 items-center justify-between pb-2">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass border-primary/20">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Security Active</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl glass",
              isLiveConnected ? "border-emerald-500/20" : "border-amber-500/20"
            )}>
              <Activity size={16} className={isLiveConnected ? "text-emerald-500" : "text-amber-500"} />
              <span className={cn("text-xs font-bold uppercase tracking-wider", isLiveConnected ? "text-emerald-500" : "text-amber-500")}>
                {isLiveConnected
                  ? (hasLive ? "LIVE SYNC ● ESP32 Connected" : "CONNECTED — Awaiting Sensor")
                  : "OFFLINE — Simulated Data"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
            <Cpu size={14} />
            <span>Firmware v2.4.1</span>
          </div>
        </motion.div>

        {/* ─── POWER MANAGEMENT ─── */}
        <motion.div variants={cardVariants} className="lg:col-span-4">
          <Card className="glass rounded-[2.5rem] p-8 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-2 w-12 bg-primary/20 rounded-full mb-4" />
                  <h3 className="text-2xl font-black tracking-tighter">Solar Power</h3>
                  <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mt-1">Energy Management</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl grid place-items-center border shadow-lg", batteryTone(batteryLevel))}>
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>

              <div className="mt-12 mb-auto flex items-center justify-center">
                <div className="relative">
                  <MetricRing
                    value={solar.batteryPct}
                    label="Battery"
                    color="#10b981"
                    icon={BatteryCharging}
                  />
                  {solar.charging && (
                    <motion.div
                      animate={{ opacity: [0, 1, 0], y: [-10, -20] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary"
                    >
                      <Zap size={14} fill="currentColor" />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="mt-12 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center"><Zap size={14} /></div>
                    <span className="text-xs font-bold text-muted-foreground/85 tracking-wide uppercase">Voltage</span>
                  </div>
                  <span className="text-sm font-black">{solar.voltage.toFixed(1)} V</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 grid place-items-center"><Thermometer size={14} /></div>
                    <span className="text-xs font-bold text-muted-foreground/85 tracking-wide uppercase">Output Power</span>
                  </div>
                  <span className="text-sm font-black">{solar.wattage} W</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center"><Wind size={14} /></div>
                    <span className="text-xs font-bold text-muted-foreground/85 tracking-wide uppercase">Panel Efficiency</span>
                  </div>
                  <span className="text-sm font-black">{solar.panelPct}%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ─── MOTOR COMMAND CENTER ─── */}
        <motion.div variants={cardVariants} className="lg:col-span-8">
          <Card className="glass rounded-[2.5rem] p-4 h-full relative overflow-hidden border-primary/10">
            <div className="absolute inset-0 bg-farm opacity-[0.03] pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col p-4 md:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-16 w-16 rounded-[1.5rem] grid place-items-center transition-all duration-700 shadow-2xl relative",
                    pumpOn ? "bg-primary text-white shadow-primary/40 rotate-180" : "bg-muted text-muted-foreground"
                  )}>
                    <Power size={28} strokeWidth={2.5} />
                    {pumpOn && (
                      <span className="absolute inset-0 rounded-[1.5rem] animate-ping bg-primary/20 scale-150" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Motor Terminal</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("h-2 w-2 rounded-full", pumpOn ? "bg-primary animate-pulse" : "bg-muted-foreground/80")} />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80">
                        {pumpOn ? "Processing Commands" : "System IDLE"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl shadow-sm border border-white/10">
                  <button
                    onClick={() => handleSetMode('AUTO')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold tracking-widest transition-all",
                      state.pumpMode === 'AUTO' ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-muted"
                    )}
                  >AUTO</button>
                  <button
                    onClick={() => handleSetMode('MANUAL')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold tracking-widest transition-all",
                      state.pumpMode === 'MANUAL' ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-muted-foreground hover:bg-muted"
                    )}
                  >MANUAL</button>
                </div>
              </div>

              <div className="mt-12 grid md:grid-cols-2 gap-6">
                {/* Interactive Control */}
                <div className="bg-muted/20 rounded-[2rem] p-6 border border-white/5 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold tracking-[0.15em] text-muted-foreground/85 uppercase">Manual Toggle</span>
                    <Settings size={14} className="text-muted-foreground/60" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black">{pumpOn ? "Active" : "Paused"}</div>
                      <div className="text-[10px] text-muted-foreground/85 font-black uppercase tracking-widest">Main Submersible</div>
                    </div>
                    <Toggle
                      disabled={state.pumpMode !== 'MANUAL'}
                      checked={state.pumpOn}
                      onCheckedChange={handleManualToggle}
                      className="scale-125 data-[state=checked]:bg-primary"
                    />
                  </div>

                </div>

                {/* Flow Stats */}
                <div className="rounded-[2rem] p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/5 flex flex-col">
                  <div className="text-xs font-bold tracking-[0.15em] text-primary uppercase mb-4">Saturation Metrics</div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tighter">{soilMoisture.toFixed(1)}</span>
                    <span className="text-xl font-bold text-primary pb-1">%</span>
                  </div>
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-primary/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-muted-foreground/85 uppercase opacity-100">Health</span>
                      <span className={cn("text-xs font-black", healthColor)}>{healthStatus}</span>
                    </div>
                    <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${soilMoisture}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex-1 bg-muted/10 rounded-3xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-2">
                {state.rlAction ? (
                  <>
                    <div className="flex items-center gap-2 text-primary">
                      <Cpu size={14} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">RL Engine Insight</span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground leading-relaxed font-medium">
                      "Autonomous agent recommends <span className="text-primary font-bold">{state.rlAction.litres}L</span>: {state.rlAction.reasoning.toLowerCase()}"
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-center text-muted-foreground/70 max-w-md italic leading-relaxed">
                    "System is monitoring real-time sensor data and battery levels to ensure optimal irrigation schedules."
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Shell >
  );
}
