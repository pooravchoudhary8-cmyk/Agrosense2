import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Leaf, ShieldCheck, Zap, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/app-context";
import { motion } from "framer-motion";
import AgroLogo from "@/components/agro/logo";

const schema = z.object({
    email: z.string().email("Enter a valid email").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

function GoogleIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

export default function Login() {
    const [, setLocation] = useLocation();
    const { actions } = useApp();
    const { toast } = useToast();
    const [show, setShow] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = useMemo(
        () =>
            handleSubmit(async (values) => {
                const result = await actions.login(values.email);
                if (result?.user) {
                    toast({ title: "Signed in", description: "Welcome back to Agro-Sense." });
                    setLocation("/");
                } else {
                    toast({
                        title: "Sign in failed",
                        description: result?.message || "Please try again.",
                        variant: "destructive",
                    });
                }
            }),
        [actions, handleSubmit, setLocation, toast],
    );

    const handleGoogleLogin = () => {
        actions.loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-farm grain flex items-center justify-center p-4">
            <div className="mx-auto max-w-6xl w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hidden lg:block"
                    >
                        <div className="max-w-md">
                            <div className="mb-12">
                                <AgroLogo size={32} />
                                <p className="text-muted-foreground font-medium mt-4 max-w-sm">
                                    Strategic biological intelligence for the modern autonomous farm.
                                </p>
                            </div>

                            <Card className="glass rounded-[2rem] p-8 border-white/10 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap size={100} />
                                </div>
                                <div className="text-lg leading-relaxed text-muted-foreground font-medium" data-testid="text-login-blurb">
                                    Revolutionizing agriculture with <span className="text-foreground border-b-2 border-primary/30">real-time IoT monitoring</span> and smart advisory systems.
                                </div>
                                <div className="mt-8 grid gap-4">
                                    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors" data-testid="card-login-highlight-1">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">Secure Infrastructure</div>
                                            <div className="text-xs text-muted-foreground">Encryption from sensor to dashboard.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors" data-testid="card-login-highlight-2">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 grid place-items-center">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">Global Accessibility</div>
                                            <div className="text-xs text-muted-foreground">Monitor your farm from anywhere.</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex justify-center lg:justify-end"
                    >
                        <Card className="glass w-full max-w-md rounded-[2.5rem] p-10 border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden" data-testid="card-login">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                            <div className="lg:hidden mb-12 text-center">
                                <AgroLogo size={24} className="justify-center scale-90" />
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                                <p className="text-sm text-muted-foreground mt-1">Please enter your details to sign in.</p>
                            </div>

                            <form className="grid gap-6" onSubmit={onSubmit} data-testid="form-login">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="farmer@agrosense.com"
                                        className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary/30 transition-all text-base"
                                        {...register("email")}
                                        data-testid="input-email"
                                    />
                                    {errors.email && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-destructive mt-1" data-testid="error-email">{errors.email.message}</motion.div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                                        <button type="button" className="text-xs font-bold text-primary hover:underline transition" data-testid="link-forgot-password">Forgot?</button>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={show ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary/30 transition-all text-base"
                                            {...register("password")}
                                            data-testid="input-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => setShow((s) => !s)}
                                            data-testid="button-toggle-password"
                                        >
                                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-bold text-destructive mt-1" data-testid="error-password">{errors.password.message}</motion.div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                                    disabled={isSubmitting}
                                    data-testid="button-sign-in"
                                >
                                    {isSubmitting ? "Authenticating…" : "Sign In to Farm"}
                                </Button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-card/0 px-4 text-muted-foreground/60 backdrop-blur-sm">Secure Portal</span></div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-2xl h-14 gap-3 font-bold text-base border-2 hover:bg-muted/60 hover:border-primary/20 transition-all active:scale-[0.98]"
                                    onClick={handleGoogleLogin}
                                    data-testid="button-google-login"
                                >
                                    <GoogleIcon className="h-5 w-5" />
                                    Continue with Google
                                </Button>

                                <div className="text-center text-sm font-medium text-muted-foreground mt-2" data-testid="text-signup">
                                    New to the field?{" "}
                                    <button type="button" className="text-primary font-bold hover:underline" data-testid="link-sign-up">Request Access</button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
