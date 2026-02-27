import { Switch, Route, Redirect, useLocation } from "wouter";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Login from "./pages/login";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Progress from "./pages/progress";
import Notifications from "./pages/notifications";
import Profile from "./pages/profile";
import Help from "./pages/help";
import { AppProvider, useApp } from "@/context/app-context";
import { WelcomeOnboarding } from "@/components/agro/welcome-onboarding";
import AdvisoryBot from "@/components/agro/advisory-bot";

function Protected({ children }) {
    const { state } = useApp();
    if (state.authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-farm grain">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }
    if (!state.user) return <Redirect to="/login" />;
    return <>{children}</>;
}

function Router() {
    const [location] = useLocation();
    const isLoginPage = location === "/login";

    return (
        <>
            {!isLoginPage && <AdvisoryBot />}
            <Switch>
                <Route path="/login" component={Login} />

                <Route path="/">
                    <Protected>
                        <Home />
                    </Protected>
                </Route>

                <Route path="/dashboard">
                    <Protected>
                        <Dashboard />
                    </Protected>
                </Route>

                <Route path="/progress">
                    <Protected>
                        <Progress />
                    </Protected>
                </Route>

                <Route path="/notifications">
                    <Protected>
                        <Notifications />
                    </Protected>
                </Route>

                <Route path="/profile">
                    <Protected>
                        <Profile />
                    </Protected>
                </Route>

                <Route path="/help">
                    <Protected>
                        <Help />
                    </Protected>
                </Route>

                <Route component={NotFound} />
            </Switch>
        </>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AppProvider>
                    <Toaster />
                    <WelcomeOnboarding />
                    <Router />
                </AppProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
