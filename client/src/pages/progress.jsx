import Shell from "@/components/agro/shell";
import { Card } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    AreaChart,
    Area,
} from "recharts";
import {
    TrendingUp,
    Sprout,
    Droplets,
    AlertCircle,
    Calendar,
    Zap,
    Wind,
    Sun,
    Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function soilMoistureTrend(idx, current) {
    return (current ?? 50) + (Math.cos(idx * 0.9) * 5);
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function Progress() {
    const { state } = useApp();
    const sensor = state.liveSensor;
    const hasLive = Boolean(sensor);

    // Values from state with absolute fallbacks
    const currentMoisture = state.soilMoisture ?? 50;
    const temp = hasLive ? (sensor?.temperature ?? 24) : 24;
    const hum = hasLive ? (sensor?.humidity ?? 50) : 50;

    // Simulated weekly data based on current levels to maintain consistency
    const usageData = useMemo(() => {
        return days.map((d, idx) => {
            const base = 42;
            const seed = (idx + 1) * 7.5;
            // Higher temp = more water used
            const tempFactor = (temp - 20) * 1.5;
            return {
                day: d,
                liters: Math.max(20, Math.round(base + Math.sin(seed) * 10 + tempFactor)),
                moisture: Math.round(soilMoistureTrend(idx, currentMoisture)),
            };
        });
    }, [temp, currentMoisture]);

    const totalLiters = usageData.reduce((a, b) => a + b.liters, 0);
    const avgLiters = Math.round(totalLiters / usageData.length);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <Shell title="Analytics Intelligence" subtitle="Deep insights into your farm's performance and predictive growth metrics.">
            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* ─── MAIN CHARTS ROW ─── */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Water Usage Panel */}
                    <motion.div variants={itemVariants} className="lg:col-span-8">
                        <Card className="glass rounded-[2rem] p-8 h-full flex flex-col group relative overflow-hidden">
                            <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-primary/2 rounded-full blur-3xl" />

                            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-1 w-12 bg-primary/30 rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Consumption Analysis</span>
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                                        Weekly Flow
                                        <TrendingUp size={20} className="text-primary mb-1" />
                                    </h3>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground/40 leading-none mb-1 tracking-widest">Total Usage</span>
                                        <span className="text-2xl font-black tracking-tighter leading-none">{totalLiters}L</span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-border/40 pl-8">
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground/40 leading-none mb-1 tracking-widest">Efficiency Rating</span>
                                        <span className="text-2xl font-black tracking-tighter leading-none text-primary">A+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-[300px] mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={usageData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground)/0.6)" }}
                                            dy={10}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground)/0.6)" }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="glass rounded-xl p-3 border border-primary/20 shadow-xl">
                                                            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{payload[0].payload.day} Usage</div>
                                                            <div className="text-lg font-black">{payload[0].value} Liters</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="liters"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#usageGradient)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Sensor Insights Micro-Card Grid */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 grid grid-cols-1 gap-6">
                        <Card className="glass rounded-[2rem] p-6 border-white/5 bg-muted/20 relative group overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                                    <Sprout size={18} />
                                </div>
                                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-primary/20 text-primary">Live</Badge>
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-[0.1em] text-muted-foreground/60 mb-1 leading-none">Soil Saturation</h4>
                            <div className="text-4xl font-black tracking-tighter mb-4 leading-none">{currentMoisture.toFixed(1)}%</div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    className="bg-primary h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentMoisture}%` }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>
                            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground/80 font-medium italic">
                                Moisture is {currentMoisture < 30 ? 'critical' : 'optimal'} for {state.cropType ?? 'Wheat'} in its current stage.
                            </p>
                        </Card>

                        <Card className="glass rounded-[2rem] p-6 border-white/5 relative group overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center">
                                    <Sun size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Atmosphere</h4>
                                    <div className="text-lg font-black tracking-tight leading-none">{temp}°C</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wind size={12} className="text-muted-foreground/40" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-none">Humidity</span>
                                    </div>
                                    <span className="text-xs font-black">{hum}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap size={12} className="text-muted-foreground/40" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-none">Intensity</span>
                                    </div>
                                    <span className="text-xs font-black">High UV</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border/20">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/70">Evaporation Alert imminent</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* ─── CROP PREDICTION FOOTER ─── */}
                <motion.div variants={itemVariants}>
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative w-40 h-40 flex-shrink-0 group">
                            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse group-hover:bg-primary/20 transition-all duration-1000" />
                            <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1 leading-none">Growth</span>
                                <span className="text-4xl font-black tracking-tighter leading-none">82%</span>
                                <Badge className="mt-2 text-[8px] bg-primary text-white border-none py-0 px-2">+4%</Badge>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black tracking-tighter mb-4 text-center md:text-left">Yield Prediction Intelligence</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: "Est. harvest", val: "24 Nov", icon: Calendar },
                                    { label: "Est. Yield", val: "4.2 t/ha", icon: Sprout },
                                    { label: "Water Eff.", val: "94%", icon: Droplets },
                                    { label: "Health Index", val: "Optimal", icon: Activity }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col p-4 rounded-2xl bg-muted/30 border border-white/5 hover-elevate transition-all">
                                        <stat.icon size={14} className="text-primary/40 mb-3" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1 leading-none">{stat.label}</span>
                                        <span className="text-sm font-black leading-none">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </Shell>
    );
}

