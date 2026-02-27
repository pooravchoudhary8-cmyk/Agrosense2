import React, { useState, useEffect, useRef } from "react";
import Shell from "@/components/agro/shell";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
    Send,
    Bot,
    User,
    Sparkles,
    Droplet,
    CloudRain,
    Zap,
    RefreshCw,
    MessageCircle,
    Calendar,
    Sprout,
    ShieldCheck,
    Loader2,
    Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGES = {
    english: "🌾 Namaste! I'm **Kisan** — your agriculture expert. Ask me about crops, irrigation, soil health, pest control, or any farming question!",
    hindi: "🌾 नमस्ते! मैं **किसान** हूँ — आपका कृषि विशेषज्ञ। मुझसे फसल, सिंचाई, मिट्टी की सेहत, कीट नियंत्रण, या कोई भी खेती से जुड़ा सवाल पूछें!"
};

const SUGGESTIONS = {
    english: [
        { label: "Best Sowing Time", icon: Calendar, query: "When is the best time to sow wheat in North India?" },
        { label: "Fertilizer Schedule", icon: Sprout, query: "What fertilizer schedule should I follow for rice crop?" },
        { label: "Pest Prevention", icon: ShieldCheck, query: "How to prevent aphids in mustard crop?" },
        { label: "Maximize Yield", icon: Zap, query: "How can I increase wheat yield per hectare?" },
        { label: "Soil pH Health", icon: Droplet, query: "What is the ideal soil pH for tomato cultivation?" },
        { label: "Watering Advice", icon: CloudRain, query: "What is the best irrigation schedule for sugarcane?" },
    ],
    hindi: [
        { label: "बुवाई का समय", icon: Calendar, query: "उत्तर भारत में गेहूं बोने का सबसे अच्छा समय कब है?" },
        { label: "उर्वरक अनुसूची", icon: Sprout, query: "धान की फसल के लिए कौन सा उर्वरक कार्यक्रम अपनाएं?" },
        { label: "कीट रोकथाम", icon: ShieldCheck, query: "सरसों में माहू (एफिड) कैसे रोकें?" },
        { label: "अधिक उपज", icon: Zap, query: "गेहूं की प्रति हेक्टेयर उपज कैसे बढ़ाएं?" },
        { label: "मिट्टी pH", icon: Droplet, query: "टमाटर की खेती के लिए मिट्टी का आदर्श pH क्या है?" },
        { label: "सिंचाई सलाह", icon: CloudRain, query: "गन्ने की सिंचाई कब और कैसे करें?" },
    ]
};

export default function Help() {
    const { state } = useApp();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState("english");
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "bot",
            text: WELCOME_MESSAGES.english,
            time: new Date()
        }
    ]);
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const toggleLanguage = () => {
        const newLang = language === "english" ? "hindi" : "english";
        setLanguage(newLang);

        // Add a system message about the language switch
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: "bot",
            text: newLang === "hindi"
                ? "🔄 भाषा **हिंदी** में बदल दी गई है। अब आप हिंदी में सवाल पूछ सकते हैं!"
                : "🔄 Language switched to **English**. You can now ask questions in English!",
            time: new Date()
        }]);
    };

    const handleSend = async (text) => {
        const messageText = text || input;
        if (!messageText.trim() || isTyping) return;

        const newUserMsg = {
            id: Date.now(),
            type: "user",
            text: messageText,
            time: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newUserMsg].map(m => ({ type: m.type, text: m.text })),
                    language: language
                })
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: "bot",
                    text: data.reply,
                    time: new Date()
                }]);
            } else if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: "bot",
                text: language === "hindi"
                    ? "⚠️ चैटबॉट सेवा से कनेक्ट नहीं हो पा रहा। कृपया बैकएंड सर्वर जाँचें और पुनः प्रयास करें।"
                    : "⚠️ I'm unable to connect to the chatbot service right now. Please check your backend server and try again.",
                time: new Date()
            }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleReset = async () => {
        setMessages([{
            id: Date.now(),
            type: "bot",
            text: language === "hindi"
                ? "🌾 चैट साफ़ हो गई! आज आपकी खेती में कैसे मदद कर सकता हूँ?"
                : "🌾 Chat cleared! How can I help you with your farming today?",
            time: new Date()
        }]);
        try {
            await fetch("/api/chat/reset", { method: "POST" });
        } catch (err) {
            console.warn("Could not reset server chat session:", err);
        }
    };

    const currentSuggestions = SUGGESTIONS[language];

    return (
        <Shell title="Kisan AI">
            <div className="max-w-6xl mx-auto -mt-10">
                <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">

                    {/* CHAT INTERFACE */}
                    <Card className="lg:col-span-3 flex flex-col glass rounded-[2rem] overflow-hidden border-white/5 shadow-xl relative">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <MessageCircle size={14} /> Live Agent
                                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
                            </h3>
                            <div className="flex items-center gap-2">
                                {/* Language Toggle */}
                                <button
                                    onClick={toggleLanguage}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                    title={language === "english" ? "Switch to Hindi" : "Switch to English"}
                                >
                                    <Languages size={14} className="text-primary" />
                                    <div className="relative flex items-center bg-background/50 rounded-md p-0.5 w-[72px] h-[26px]">
                                        <motion.div
                                            className="absolute h-[22px] w-[34px] bg-primary rounded-[5px] shadow-sm"
                                            animate={{ x: language === "english" ? 1 : 35 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                        <span className={cn(
                                            "relative z-10 w-[34px] text-center text-[9px] font-black uppercase transition-colors",
                                            language === "english" ? "text-white" : "text-muted-foreground"
                                        )}>
                                            EN
                                        </span>
                                        <span className={cn(
                                            "relative z-10 w-[34px] text-center text-[9px] font-black uppercase transition-colors",
                                            language === "hindi" ? "text-white" : "text-muted-foreground"
                                        )}>
                                            हि
                                        </span>
                                    </div>
                                </button>
                                {/* Reset Button */}
                                <button
                                    onClick={handleReset}
                                    className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground transition-all hover:text-primary"
                                    title="Clear chat"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "flex items-start gap-3",
                                            msg.type === "user" ? "flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                                            msg.type === "bot"
                                                ? "bg-primary border-primary text-white"
                                                : "bg-white/10 text-white border-white/20"
                                        )}>
                                            {msg.type === "bot" ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={cn(
                                            "max-w-[85%] px-5 py-3 rounded-[1.5rem] text-sm leading-relaxed",
                                            msg.type === "bot"
                                                ? "bg-white/5 border border-white/5 rounded-tl-none"
                                                : "bg-primary text-white rounded-tr-none shadow-lg"
                                        )}>
                                            {msg.type === "bot" ? (
                                                <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-primary [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-3 [&_a]:text-primary [&_blockquote]:border-l-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                            <div className="text-[8px] mt-1.5 opacity-40 font-bold uppercase">
                                                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                                        <Bot size={16} />
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/5">
                                        <Loader2 size={14} className="animate-spin text-primary" />
                                        <span className="text-xs text-muted-foreground">
                                            {language === "hindi" ? "किसान सोच रहा है..." : "Kisan is thinking..."}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-5 bg-white/5 border-t border-white/5">
                            <div className="relative flex items-center max-w-4xl mx-auto">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder={language === "hindi"
                                        ? "किसान से खेती, फसल, सिंचाई के बारे में पूछें..."
                                        : "Ask Kisan about farming, crops, irrigation..."}
                                    disabled={isTyping}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 h-10 w-10 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                >
                                    {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* SUGGESTIONS */}
                    <div className="hidden lg:flex flex-col gap-4">
                        <Card className="glass rounded-[2rem] p-6 border-white/5 flex flex-col gap-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Sparkles size={12} /> {language === "hindi" ? "त्वरित प्रश्न" : "Quick Queries"}
                            </h4>
                            <div className="space-y-2">
                                {currentSuggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(s.query)}
                                        disabled={isTyping}
                                        className="w-full group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all group-hover:scale-110">
                                            <s.icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-foreground">
                                            {s.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </Shell>
    );
}
