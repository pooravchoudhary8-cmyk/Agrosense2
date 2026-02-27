import Navbar from "@/components/agro/navbar";
import { motion } from "framer-motion";

export default function Shell({
    title,
    subtitle,
    children,
    centered = false,
}) {
    return (
        <div className="min-h-screen bg-farm grain flex flex-col">
            <Navbar />
            <main className="flex-1 w-full pt-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-primary/5 pb-6">
                            <div className={centered ? "text-center mx-auto" : "text-left"}>
                                <h1
                                    className="font-serif text-3xl sm:text-5xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic"
                                    data-testid="text-page-title"
                                >
                                    {title}
                                </h1>
                                {subtitle ? (
                                    <p
                                        className={centered ? "mt-2 text-muted-foreground max-w-2xl text-base leading-tight mx-auto" : "mt-2 text-muted-foreground max-w-2xl text-base leading-tight"}
                                        data-testid="text-page-subtitle"
                                    >
                                        {subtitle}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="stagger-visible">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
