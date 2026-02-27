import React from "react";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgroLogo({ className = "", size = 20, hideText = false }) {
    return (
        <div
            className={cn("inline-flex items-center gap-5 group cursor-pointer", className)}
            data-testid="brand-agro-sense"
        >
            <div className="relative flex-shrink-0">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-blue-500/30 rounded-[1.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-125" />

                {/* Main Logo Container */}
                <div
                    className="relative h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center justify-center overflow-visible border border-white/20"
                    data-testid="img-logo"
                >
                    {/* Interior Technical Ring */}
                    <div className="absolute inset-2 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-3 rounded-full border border-dashed border-white/5 animate-[spin_15s_linear_infinite_reverse]" />

                    {/* Droplets Layer */}
                    <div className="relative z-10 text-white flex items-center justify-center">
                        <motion.div
                            animate={{
                                y: [0, -3, 0],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="relative flex items-center justify-center">
                                <Droplets size={size + 12} strokeWidth={2.5} className="drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]" />

                                {/* Micro-detail: Floating Particles */}
                                <motion.div
                                    animate={{
                                        opacity: [0, 1, 0],
                                        y: [-10, -20],
                                        x: [5, 10]
                                    }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute top-0 right-0 h-1 w-1 bg-white rounded-full blur-[0.5px]"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* The "Smart" Pulse Dot */}
                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-black flex items-center justify-center shadow-xl border border-white/10">
                        <div className="relative h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_15px_white]">
                            <motion.div
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 rounded-full bg-white"
                            />
                        </div>
                    </div>

                    {/* Hyper-realistic Gloss */}
                    <div className="absolute inset-x-2 top-1 h-[40%] bg-gradient-to-b from-white/30 to-transparent rounded-t-[1.2rem] pointer-events-none" />
                </div>
            </div>

            {!hideText && (
                <div className="flex flex-col py-1">
                    <div
                        className="flex items-center text-4xl font-black tracking-tighter leading-none"
                        data-testid="text-app-title"
                    >
                        <span className="text-foreground transition-all group-hover:text-blue-500 group-hover:tracking-normal duration-500">
                            AGRO
                        </span>
                        <span className="relative ml-1 text-blue-500">
                            SENSE
                            {/* Creative underline element */}
                            <div className="absolute -bottom-1 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700 group-hover:w-full" />
                        </span>
                    </div>
                    <div
                        className="flex items-center gap-2 mt-2"
                        data-testid="text-app-subtitle"
                    >
                        <div className="h-0.5 w-6 bg-blue-500/20 rounded-full" />
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground/30 group-hover:text-blue-500/50 transition-colors duration-700">
                            Precision Node
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
