import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const AppContext = createContext(null);

function nowTimeLabel() {
    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date());
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function seededNoise(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function generateWeather(seed) {
    const tempC = 18 + seededNoise(seed) * 14;
    const humidity = 48 + seededNoise(seed + 2) * 40;
    const windKph = 4 + seededNoise(seed + 3) * 18;
    const rainChance = seededNoise(seed + 4) * 90;
    return { rainChance };
}

// Real weather fetching from Open-Meteo (Free, No Key)
async function fetchRealWeather(lat, lng) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&forecast_days=1`);
        const data = await res.json();

        if (!data.current) return null;

        const code = data.current.weather_code;
        let condition = "Clear";
        if (code >= 1 && code <= 3) condition = "Cloudy";
        if (code >= 45 && code <= 48) condition = "Fog";
        if (code >= 51 && code <= 67) condition = "Rain";
        if (code >= 71 && code <= 77) condition = "Snow";
        if (code >= 80 && code <= 82) condition = "Rain";
        if (code >= 95) condition = "Thunderstorm";

        return {
            tempC: Math.round(data.current.temperature_2m * 10) / 10,
            condition,
            humidity: Math.round(data.current.relative_humidity_2m),
            windKph: Math.round(data.current.wind_speed_10m * 10) / 10,
            rainChance: Math.round(data.current.precipitation * 10), // simplified
        };
    } catch (e) {
        console.error("Weather fetch failed:", e);
        return null;
    }
}

function createInitialState() {
    return {
        user: null,
        authLoading: true, // loading until we check the server
        cropType: "Wheat",
        cropAgeDays: 42,
        soilType: "Alluvial Soil",
        cropStage: "Germination",
        soilMoisture: 0,
        soilStatus: "Waiting",
        liveSensor: null,
        mqttStatus: "disconnected",
        rainDetected: false,
        batteryLevel: 0,
        batteryCharging: false,
        pumpMode: "AUTO",
        pumpOn: false,
        cityName: "Detecting...",
        manualLocation: false,
        locationCoords: null,
        gpsCoords: null,
        weather: {
            tempC: 0,
            condition: "--",
            humidity: 0,
            windKph: 0,
            rainChance: 0,
            locationName: "Farm"
        },
        aiAdvisory: null,
        notifications: [
            {
                id: "n1",
                type: "ai",
                title: "Kisan AI: Tactical Ready",
                message: "Intelligence engine is monitoring field telemetry.",
                time: "Online",
            },
        ],
        rlAction: null,
        ndviData: null,
        irrigationPrediction: null,
        intelligenceEngine: null, // ← FastAPI Intelligence Engine results
        engineHealthy: false,
        soilClassification: null, // ← CNN-based Soil Classification result
    };
}

export function AppProvider({ children }) {
    const [state, setState] = useState(() => createInitialState());

    // Real-time location tracking
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                setState((s) => ({
                    ...s,
                    gpsCoords: { lat, lng },
                    // If no manual location, use GPS coords as primary
                    locationCoords: s.manualLocation ? s.locationCoords : { lat, lng }
                }));

                // Reverse geocode for display name (via server proxy to avoid CORS)
                if (!state.manualLocation) {
                    fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`)
                        .then(res => res.json())
                        .then(data => {
                            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Detected Location";
                            setState(s => ({
                                ...s,
                                cityName: s.manualLocation ? s.cityName : city
                            }));
                        })
                        .catch(e => console.warn("Geocoding failed:", e));
                }
            },
            (err) => console.error("Location error:", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [state.manualLocation]);

    // Update weather based on coords
    useEffect(() => {
        if (state.locationCoords) {
            fetchRealWeather(state.locationCoords.lat, state.locationCoords.lng).then(w => {
                if (w) setState(s => ({ ...s, weather: { ...w, locationName: s.cityName || "Farm" } }));
            });
        }
    }, [state.locationCoords, state.cityName]);

    // Live MQTT sensor stream via Socket.IO
    useEffect(() => {
        const socket = io("http://localhost:5001", {
            transports: ["polling", "websocket"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socket.on("connect", () => {
            console.log("✅ Socket.IO connected to backend:", socket.id);
            setState((s) => ({ ...s, mqttStatus: "connected" }));
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ Socket.IO disconnected:", reason);
            setState((s) => ({ ...s, mqttStatus: "disconnected" }));
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Socket.IO connection error:", err.message);
            setState((s) => ({ ...s, mqttStatus: "error" }));
        });

        socket.on("sensor-data", (data) => {
            console.log("📡 Sensor data received:", data);
            const soil = data?.soil_moisture;
            const rain_detected = data?.rain_detected;

            setState((s) => ({
                ...s,
                liveSensor: data,
                soilMoisture: (soil !== undefined && soil !== null) ? soil : s.soilMoisture,
                rainDetected: (rain_detected !== undefined && rain_detected !== null) ? rain_detected : s.rainDetected,
                soilStatus: "Live",
            }));
        });

        // ── RL Irrigation Optimizer ──────────────────────────────────────────
        socket.on("rl-action", (rlData) => {
            console.log("🤖 [RL] Optimization received:", rlData.litres, "L");
            setState((s) => {
                const notif = {
                    id: `rl_${Date.now()}`,
                    type: rlData.litres > 0 ? "warning" : "success",
                    title: `🤖 RL Optimization: ${rlData.litres}L`,
                    message: rlData.reasoning,
                    time: nowTimeLabel(),
                };
                return {
                    ...s,
                    rlAction: rlData,
                    notifications: [notif, ...s.notifications].slice(0, 30),
                };
            });
        });

        // ── NDVI Satellite Analysis ──────────────────────────────────────────
        socket.on("ndvi-data", (ndviData) => {
            console.log("🛰️  [NDVI] Satellite data received:", ndviData.score, ndviData.health_status);
            setState((s) => ({
                ...s,
                ndviData: ndviData,
            }));
        });

        // Auto pump decisions from server (rain detected / soil threshold crossed)
        socket.on("pump-state", (data) => {
            console.log("🤖 [AUTO] Pump state update from server:", data);
            setState((s) => ({
                ...s,
                pumpOn: data.pumpOn,
                pumpMode: data.mode ?? s.pumpMode,
            }));
        });

        // ── RAG Advisory from ChromaDB + Gemini ─────────────────────────────
        socket.on("rag-advisory", (advisory) => {
            console.log("🌾 RAG Advisory received:", advisory.action, advisory.confidence);
            setState((s) => {
                const notif = {
                    id: `rag_${Date.now()}`,
                    type: advisory.irrigation_needed ? "warning" : "success",
                    title: advisory.irrigation_needed
                        ? `⚡ Kisan: ${advisory.action} RECOMMENDED`
                        : `✅ Kisan: Field Conditions OK`,
                    message: advisory.reasoning,
                    time: nowTimeLabel(),
                };
                return {
                    ...s,
                    ragAdvisory: advisory,
                    // keep aiAdvisory in sync so advisory-bot picks it up
                    aiAdvisory: {
                        message: advisory.reasoning,
                        needed: advisory.irrigation_needed,
                        confidence: advisory.confidence,
                        action: advisory.action,
                        urgency: advisory.urgency,
                        fullText: advisory.advisory,
                        sensorSnapshot: advisory.sensor_snapshot,
                        timestamp: advisory.timestamp,
                    },
                    notifications: [notif, ...s.notifications].slice(0, 30),
                };
            });
        });

        // legacy ai-advisory event (kept for backwards compat)
        socket.on("ai-advisory", (advisory) => {
            setState((s) => {
                const newNotifications = [...s.notifications];
                newNotifications.unshift({
                    id: `ai_${Date.now()}`,
                    type: advisory.needed ? "warning" : "success",
                    title: advisory.needed ? "AI: Action Required" : "AI: Conditions Optimal",
                    message: advisory.message,
                    time: nowTimeLabel(),
                });
                return {
                    ...s,
                    aiAdvisory: s.ragAdvisory ? s.aiAdvisory : advisory,
                    notifications: newNotifications.slice(0, 30),
                };
            });
        });

        // ── Intelligence Engine (FastAPI 5-module pipeline) ──────────────────
        socket.on("intelligence-engine", (data) => {
            console.log("🤖 Intelligence Engine update:", data.timestamp);
            setState((s) => ({
                ...s,
                intelligenceEngine: data,
                engineHealthy: data.engineHealthy,
            }));
        });

        socket.on("intelligence-engine-status", (status) => {
            setState((s) => ({ ...s, engineHealthy: status.healthy }));
        });

        return () => socket.disconnect();
    }, []);

    // Initial fetch of AI Intelligence
    useEffect(() => {
        const fetchInitialAI = async () => {
            try {
                const [health, summary, schedule] = await Promise.all([
                    fetch("/api/intelligence/health").then(res => res.json()),
                    fetch("/api/intelligence/water/summary").then(res => res.json()),
                    fetch("/api/intelligence/irrigation/schedule").then(res => res.json())
                ]);

                setState(s => ({
                    ...s,
                    engineHealthy: health.healthy,
                    intelligenceEngine: {
                        ...s.intelligenceEngine,
                        waterAnalytics: summary,
                        irrigation: schedule?.schedule?.[0] || null
                    }
                }));
            } catch (err) {
                console.warn("AI Engine pre-fetch failed:", err);
            }
        };

        fetchInitialAI();
    }, []);

    // Check if user is already logged in via server session
    useEffect(() => {
        fetch("/api/auth/me", { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setState((s) => ({
                        ...s,
                        user: {
                            id: data.user.id,
                            name: data.user.name || data.user.username || "Farmer",
                            username: data.user.username || data.user.name || "Farmer",
                            email: data.user.email,
                            contact: data.user.contact || "",
                            avatar: data.user.avatar || null,
                            location: data.user.location || "Detected via GPS",
                            soilType: data.user.soilType || null,
                            cropType: data.user.cropType || null,
                            cropStage: data.user.cropStage || null,
                            cropStartDate: new Date(Date.now() - s.cropAgeDays * 86400000)
                                .toISOString()
                                .slice(0, 10),
                        },
                        // Sync top-level agro fields from saved profile
                        cropType: data.user.cropType || s.cropType,
                        soilType: data.user.soilType || s.soilType,
                        cropStage: data.user.cropStage || s.cropStage,
                        authLoading: false,
                    }));
                } else {
                    setState((s) => ({ ...s, authLoading: false }));
                }
            })
            .catch(() => {
                setState((s) => ({ ...s, authLoading: false }));
            });
    }, []);

    // NOTE: Simulation tick is intentionally disabled.
    // All gauges show 0 until real MQTT data arrives from the Arduino.
    // When liveSensor is populated via socket, real values are displayed.

    const actions = useMemo(() => {
        return {
            // OAuth login — redirect to Google
            loginWithGoogle: () => {
                window.location.href = "/api/auth/google";
            },

            // Demo login (email/password form — hits server session)
            login: async (email) => {
                const res = await fetch("/api/auth/demo-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                    credentials: "include",
                });
                const data = await res.json();
                if (data.user) {
                    setState((s) => ({
                        ...s,
                        user: {
                            id: data.user.id,
                            name: data.user.name || data.user.username || "Farmer",
                            username: data.user.username || data.user.name || "Farmer",
                            email: data.user.email,
                            contact: data.user.contact || "",
                            avatar: data.user.avatar || null,
                            location: data.user.location || "Detected via GPS",
                            cropStartDate: new Date(Date.now() - s.cropAgeDays * 86400000)
                                .toISOString()
                                .slice(0, 10),
                        },
                    }));
                }
                return data;
            },

            // Logout — clear server session
            logout: async () => {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                });
                setState((s) => ({ ...s, user: null }));
            },

            updateProfile: async (updates) => {
                const res = await fetch("/api/auth/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                    credentials: "include",
                });
                const data = await res.json();
                if (data.user) {
                    setState((s) => ({
                        ...s,
                        user: {
                            ...s.user,
                            ...data.user,
                        },
                        // Sync top-level agro fields from profile update
                        cropType: data.user.cropType || s.cropType,
                        soilType: data.user.soilType || s.soilType,
                        cropStage: data.user.cropStage || s.cropStage,
                    }));
                }
                return data;
            },

            setCropType: (cropType) => setState((s) => ({ ...s, cropType })),
            setSoilType: (soilType) => setState((s) => ({ ...s, soilType })),
            setCropStage: (cropStage) => setState((s) => ({ ...s, cropStage })),
            setPumpMode: (mode) => setState((s) => ({ ...s, pumpMode: mode })),
            setPumpOn: (on) => setState((s) => ({ ...s, pumpOn: on })),
            setLocation: async (city) => {
                try {
                    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
                    const data = await res.json();

                    if (data.results && data.results.length > 0) {
                        const result = data.results[0];
                        setState(s => ({
                            ...s,
                            cityName: result.name,
                            manualLocation: true,
                            locationCoords: { lat: result.latitude, lng: result.longitude }
                        }));
                    } else {
                        // Fallback to GPS if city not found
                        setState(s => ({
                            ...s,
                            cityName: "Detected Location",
                            manualLocation: false,
                            locationCoords: s.gpsCoords
                        }));
                        throw new Error("City not found, falling back to GPS");
                    }
                } catch (e) {
                    console.error("Location update failed:", e);
                    throw e;
                }
            },

            simulateData: () => {
                console.log("🛠️ [DEBUG] Simulating Field Telemetry...");
                const mockSensor = {
                    soil_moisture: 32,
                    soil1_moisture: 35,
                    soil2_moisture: 29,
                    temperature: 24,
                    humidity: 65,
                    rain_raw: 4095,
                    rain_detected: false,
                };
                const mockRL = {
                    action_index: 2,
                    litres: 20,
                    reasoning: "Soil hydration dropped below 35%. Moderate irrigation initiated to maintain root zone health.",
                    confidence: "rl_model",
                    sensor_snapshot: { ...mockSensor }
                };

                setState(s => ({
                    ...s,
                    liveSensor: mockSensor,
                    soilMoisture: 32,
                    mqttStatus: "connected",
                    rlAction: mockRL,
                    soilStatus: "Live (Simulated)"
                }));
            },

            getPrediction: async () => {
                const { soilMoisture, weather, liveSensor, cropType, soilType, cropStage } = state;
                const temp = liveSensor?.temperature ?? weather.tempC;
                const hum = liveSensor?.humidity ?? weather.humidity;

                try {
                    const res = await fetch("/api/rag/irrigation/predict", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            moisture: soilMoisture,
                            temperature: temp,
                            humidity: hum,
                            crop: cropType,
                            soil_type: soilType,
                            seedling_stage: cropStage
                        })
                    });
                    const data = await res.json();
                    setState(s => ({ ...s, irrigationPrediction: data }));
                    return data;
                } catch (e) {
                    console.error("Prediction fetch failed:", e);
                }
            },

            classifySoil: async (file) => {
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const res = await fetch("/api/soil/predict", {
                        method: "POST",
                        body: formData
                    });

                    if (!res.ok) {
                        const errBody = await res.json().catch(() => ({}));
                        const errMsg = errBody.error || `Server returned ${res.status}`;
                        console.error("Soil classification API error:", errMsg);
                        setState(s => ({ ...s, soilClassification: { error: errMsg } }));
                        return { error: errMsg };
                    }

                    const data = await res.json();

                    // If prediction is successful and high confidence, update the profile soil type automatically
                    if (data.prediction && data.confidence > 0.8) {
                        setState(s => ({ ...s, soilClassification: data, soilType: data.prediction }));
                    } else {
                        setState(s => ({ ...s, soilClassification: data }));
                    }

                    return data;
                } catch (e) {
                    console.error("Soil classification failed:", e);
                    setState(s => ({ ...s, soilClassification: { error: "Service unreachable — is soil_classifier running on port 8002?" } }));
                    throw e;
                }
            }
        };
    }, [state]);

    return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}
