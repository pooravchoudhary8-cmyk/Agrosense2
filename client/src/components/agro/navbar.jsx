import { Link, useLocation } from "wouter";
import {
    LogOut,
    Home,
    LayoutDashboard,
    LineChart,
    Bell,
    User,
    HelpCircle,
    Activity,
    Cpu,
    Zap,
    Flower2,
    ChevronDown
} from "lucide-react";
import AgroLogo from "@/components/agro/logo";
import { useApp } from "@/context/app-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const navItems = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/dashboard", label: "Command", icon: LayoutDashboard },
    { href: "/progress", label: "Analytics", icon: LineChart },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/help", label: "Help", icon: HelpCircle },
];

export default function Navbar() {
    const [location] = useLocation();
    const { state, actions } = useApp();

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-4">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl" />

            {/* GLOW DECORATION */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />

            <div className="relative z-10 w-full flex items-center gap-3">

                {/* ─── LEFT: BRAND ─── */}
                <div className="flex-shrink-0">
                    <Link href="/" className="transition-transform hover:scale-[1.02] active:scale-95 inline-block">
                        <AgroLogo className="scale-75" />
                    </Link>
                </div>

                {/* ─── CENTER: NAVIGATION ─── */}
                <nav className="hidden md:flex items-center gap-0.5 p-0.5 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                    {navItems.map((item) => {
                        const active = location === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative px-3 h-9 flex items-center gap-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 group",
                                    active ? "text-white" : "text-muted-foreground/90 hover:text-foreground"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80 rounded-lg shadow-[0_5px_15px_rgba(var(--primary-rgb),0.3)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <item.icon size={13} strokeWidth={active ? 3 : 2} className={cn("transition-transform group-hover:-translate-y-0.5", active && "text-white")} />
                                    <span className="hidden xl:inline">{item.label}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ─── Spacer ─── */}
                <div className="flex-1" />

                {/* ─── RIGHT: SYSTEM INFRA ─── */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Integrated Status Pod */}
                    <div className="hidden sm:flex items-center gap-2 px-3 h-9 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1">
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", state.mqttStatus === 'connected' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                            <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/90 leading-none">MQTT</span>
                        </div>
                        <div className="h-3.5 w-px bg-white/10" />
                        <Select
                            value={state.cropType ?? "Wheat"}
                            onValueChange={(v) => {
                                actions.setCropType(v);
                                actions.updateProfile({ cropType: v });
                            }}
                        >
                            <SelectTrigger className="h-6 w-auto border-none bg-transparent hover:bg-transparent p-0 text-[9px] font-black uppercase tracking-wider gap-1">
                                <Flower2 size={10} className="text-primary" />
                                <SelectValue placeholder="Crop" />
                            </SelectTrigger>
                            <SelectContent className="glass rounded-xl border-white/5">
                                <SelectItem value="Wheat" className="text-[10px] font-bold">Wheat</SelectItem>
                                <SelectItem value="Potato" className="text-[10px] font-bold">Potato</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="h-3.5 w-px bg-white/10" />
                        <Select
                            value={state.soilType ?? "Alluvial Soil"}
                            onValueChange={(v) => {
                                actions.setSoilType(v);
                                actions.updateProfile({ soilType: v });
                            }}
                        >
                            <SelectTrigger className="h-6 w-auto border-none bg-transparent hover:bg-transparent p-0 text-[9px] font-black uppercase tracking-wider gap-1">
                                <Zap size={10} className="text-emerald-500" />
                                <SelectValue placeholder="Soil" />
                            </SelectTrigger>
                            <SelectContent className="glass rounded-xl border-white/5">
                                <SelectItem value="Alluvial Soil" className="text-[10px] font-bold">Alluvial</SelectItem>
                                <SelectItem value="Black Soil" className="text-[10px] font-bold">Black</SelectItem>
                                <SelectItem value="Clay Soil" className="text-[10px] font-bold">Clay</SelectItem>
                                <SelectItem value="Loam Soil" className="text-[10px] font-bold">Loam</SelectItem>
                                <SelectItem value="Red Soil" className="text-[10px] font-bold">Red</SelectItem>
                                <SelectItem value="Sandy Soil" className="text-[10px] font-bold">Sandy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Exit Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => actions.logout()}
                        className="h-9 w-9 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                    >
                        <LogOut size={14} strokeWidth={3} />
                    </motion.button>
                </div>

            </div>
        </header>
    );
}
