import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
    Camera,
    Trash2,
    User,
    Mail,
    Phone,
    MapPin,
    Sprout,
    Calendar,
    ShieldCheck,
    LogOut,
    Check,
    CloudSun,
    Zap,
    Activity
} from "lucide-react";
import Shell from "@/components/agro/shell";
import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import farmerImage from "@/assets/images/farmer-profile.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Profile() {
    const { state, actions } = useApp();
    const [, setLocation] = useLocation();

    const user = state.user;
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || "",
        contact: user?.contact || "",
        location: state.cityName || "",
        avatar: user?.avatar || null,
    });

    const handleLogout = async () => {
        await actions.logout();
        setLocation("/login");
    };

    const handleSave = async () => {
        try {
            if (editData.location !== state.cityName) {
                await actions.setLocation(editData.location);
            }
            await actions.updateProfile({
                name: editData.name,
                contact: editData.contact,
                location: editData.location,
                avatar: editData.avatar
            });
            setIsEditing(false);
        } catch (err) {
            setEditData(prev => ({ ...prev, location: state.cityName }));
            setIsEditing(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setEditData(prev => ({ ...prev, avatar: null }));
    };

    return (
        <Shell title="User Profile" subtitle="Manage your agricultural identity and system preferences.">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ─── HEADER SECTION ─── */}
                <Card className="glass rounded-[2.5rem] overflow-hidden border-primary/10 shadow-2xl relative">
                    <div className="h-48 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 grain" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

                        {/* DECORATIVE ELEMENTS */}
                        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
                    </div>

                    <div className="px-12 pb-12 relative">
                        <div className="flex flex-col lg:flex-row items-end gap-8 -mt-24 relative z-10">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-44 w-44 rounded-[2.5rem] border-8 border-background shadow-2xl overflow-hidden bg-muted relative z-10">
                                    <img
                                        src={isEditing ? (editData.avatar || farmerImage) : (user?.avatar || farmerImage)}
                                        alt="Farmer Profile"
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                    <AnimatePresence>
                                        {isEditing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20"
                                            >
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="h-10 w-10 rounded-xl bg-primary text-white grid place-items-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                >
                                                    <Camera size={18} />
                                                </button>
                                                {(editData.avatar || user?.avatar) && (
                                                    <button
                                                        onClick={handleRemoveAvatar}
                                                        className="h-10 w-10 rounded-xl bg-destructive text-destructive-foreground grid place-items-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="absolute -inset-2 bg-primary/10 rounded-[3rem] blur-xl -z-10 group-hover:bg-primary/20 transition-all duration-500" />
                            </div>

                            {/* User Header Info */}
                            <div className="flex-1 pb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="text-4xl font-black bg-white/5 border border-white/10 rounded-2xl px-6 py-2 w-full max-w-md focus:ring-2 focus:ring-primary/40 outline-none"
                                                    placeholder="Enter name"
                                                />
                                                <div className="flex items-center gap-2 text-muted-foreground px-2">
                                                    <MapPin size={14} className="text-primary" />
                                                    <input
                                                        type="text"
                                                        value={editData.location}
                                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                        className="bg-transparent border-b border-primary/30 py-0.5 outline-none"
                                                        placeholder="Enter city"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h2 className="text-5xl font-black tracking-tighter text-foreground mb-2">
                                                    {user?.name ?? "Farmer"}
                                                </h2>
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm tracking-tight">
                                                        <MapPin size={16} className="text-primary" />
                                                        {state.cityName || user?.location || "Detected via GPS"}
                                                    </div>
                                                    <div className="h-5 w-px bg-white/10" />
                                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                        <ShieldCheck size={12} />
                                                        Verified Expert
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            className="px-8 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/20"
                                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                        >
                                            {isEditing ? <><Check size={16} strokeWidth={3} /> Save Data</> : <><Camera size={16} strokeWidth={3} /> Update Info</>}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="px-8 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] gap-2 border border-white/5"
                                            onClick={isEditing ? () => setIsEditing(false) : handleLogout}
                                        >
                                            {isEditing ? "Cancel" : <><LogOut size={16} strokeWidth={3} /> Exit</>}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ─── DETAILS GRID ─── */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* ACC INFO */}
                    <Card className="glass rounded-[2.5rem] p-10 border-white/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                                <User size={20} />
                            </div>
                            <h3 className="font-black text-lg uppercase tracking-tight">Personal Credentials</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Full Name</span>
                                <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                    <User size={16} className="text-primary/40 group-hover:text-primary transition-colors" />
                                    <span className="font-bold">{user?.name ?? "—"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Official Email</span>
                                <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                    <Mail size={16} className="text-primary/40 group-hover:text-primary transition-colors" />
                                    <span className="font-bold">{user?.email ?? "—"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Link Contact</span>
                                <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                    <Phone size={16} className="text-primary/40 group-hover:text-primary transition-colors" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.contact}
                                            onChange={(e) => setEditData({ ...editData, contact: e.target.value })}
                                            className="bg-transparent border-none focus:ring-0 w-full font-bold outline-none"
                                            placeholder="Add phone number"
                                        />
                                    ) : (
                                        <span className="font-bold">{user?.contact || "No contact linked"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* FIELD INFO */}
                    <Card className="glass rounded-[2.5rem] p-10 border-white/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
                                <Sprout size={20} />
                            </div>
                            <h3 className="font-black text-lg uppercase tracking-tight">Agricultural Workspace</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Field Crop</span>
                                    <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                        <Sprout size={16} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                        <span className="font-bold">{state.cropType}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Soil Type</span>
                                    <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                        <Zap size={16} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                        <span className="font-bold">{state.soilType}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Growth Stage</span>
                                <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                    <Activity size={16} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                    <span className="font-bold">{state.cropStage}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Cultivation Cycle</span>
                                <div className="flex items-center gap-3 py-3 border-b border-white/5 group">
                                    <Calendar size={16} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                    <span className="font-bold">Started on {user?.cropStartDate || "Cycle Initialized"}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </Shell>
    );
}
