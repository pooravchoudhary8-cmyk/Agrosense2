import { Bell, CloudRain, Droplets, ShieldAlert, CheckCircle2 } from "lucide-react";
import Shell from "@/components/agro/shell";
import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";

function iconFor(type) {
    if (type === "warning") return <ShieldAlert size={18} strokeWidth={2.2} />;
    if (type === "success") return <CheckCircle2 size={18} strokeWidth={2.2} />;
    return <Bell size={18} strokeWidth={2.2} />;
}

export default function Notifications() {
    const { state } = useApp();

    return (
        <Shell title="Notifications" subtitle="Latest sensor alerts and system updates.">
            <div className="grid gap-3" data-testid="list-notifications">
                {state.notifications.map((n, idx) => (
                    <Card
                        key={n.id}
                        className="glass rounded-2xl p-4 hover-elevate"
                        data-testid={`row-notification-${idx}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl grid place-items-center bg-primary/10 text-primary" data-testid={`icon-notification-${idx}`}>
                                {iconFor(n.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="font-medium" data-testid={`text-notification-title-${idx}`}>{n.title}</div>
                                    <div className="text-xs text-muted-foreground" data-testid={`text-notification-time-${idx}`}>{n.time}</div>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground" data-testid={`text-notification-message-${idx}`}>{n.message}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Shell>
    );
}
