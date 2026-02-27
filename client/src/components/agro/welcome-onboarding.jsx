import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/app-context";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function WelcomeOnboarding() {
    const { state, actions } = useApp();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [crop, setCrop] = useState("Wheat");
    const [soil, setSoil] = useState("Alluvial Soil");
    const [stage, setStage] = useState("Germination");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Prevents modal from re-opening after the user submits
    const hasSubmitted = useRef(false);

    useEffect(() => {
        // If user already submitted during this session, never re-open
        if (hasSubmitted.current) return;

        // Only show if user is logged in but has no name or no contact saved
        if (state.user && !state.authLoading) {
            const hasName = state.user.name && state.user.name !== "Farmer";
            const hasContact = state.user.contact && state.user.contact.trim() !== "";
            // Check agro info — modal is skipped if any source has the value
            const hasAgroInfo =
                (state.user.soilType || state.soilType) &&
                (state.user.cropStage || state.cropStage) &&
                (state.user.cropType || state.cropType);

            if (!hasName || !hasContact || !hasAgroInfo) {
                const timer = setTimeout(() => {
                    setName(state.user.name || "");
                    setContact(state.user.contact || "");
                    setCrop(state.user.cropType || state.cropType || "Wheat");
                    setSoil(state.user.soilType || state.soilType || "Alluvial Soil");
                    setStage(state.user.cropStage || state.cropStage || "Germination");
                    setOpen(true);
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [state.user, state.authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Sync local state IMMEDIATELY so UI updates instantly
        actions.setCropType(crop);
        actions.setSoilType(soil);
        actions.setCropStage(stage);

        try {
            await actions.updateProfile({
                name: name || state.user?.name,
                contact: contact || state.user?.contact,
                cropType: crop,
                soilType: soil,
                cropStage: stage
            });
        } catch (err) {
            console.error("Failed to save onboarding info:", err);
        } finally {
            // Mark as submitted so the effect never re-opens the modal
            hasSubmitted.current = true;
            // Always close the dialog, even if the API call fails
            setOpen(false);
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass rounded-3xl max-w-md border-white/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Welcome Kisan</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Please provide your details to personalize your agricultural experience.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="onboard-name">FullName</Label>
                        <Input
                            id="onboard-name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl h-12 bg-muted/50 border-white/10"
                            required={!state.user?.name || state.user?.name === "Farmer"}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="onboard-contact">Contact Number</Label>
                        <Input
                            id="onboard-contact"
                            placeholder="+91 XXXXX XXXXX"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="rounded-xl h-12 bg-muted/50 border-white/10"
                            required={!state.user?.contact}
                        />
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Select Crop</Label>
                                <Select value={crop} onValueChange={setCrop}>
                                    <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass">
                                        <SelectItem value="Wheat">Wheat</SelectItem>
                                        <SelectItem value="Potato">Potato</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Soil Type</Label>
                                <Select value={soil} onValueChange={setSoil}>
                                    <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass">
                                        <SelectItem value="Alluvial Soil">Alluvial Soil</SelectItem>
                                        <SelectItem value="Black Soil">Black Soil</SelectItem>
                                        <SelectItem value="Clay Soil">Clay Soil</SelectItem>
                                        <SelectItem value="Loam Soil">Loam Soil</SelectItem>
                                        <SelectItem value="Red Soil">Red Soil</SelectItem>
                                        <SelectItem value="Sandy Soil">Sandy Soil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Growth Stage</Label>
                            <Select value={stage} onValueChange={setStage}>
                                <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Germination">Germination</SelectItem>
                                    <SelectItem value="Seedling Stage">Seedling Stage</SelectItem>
                                    <SelectItem value="Vegetative Growth / Root or Tuber Development">Vegetative Growth</SelectItem>
                                    <SelectItem value="Flowering">Flowering</SelectItem>
                                    <SelectItem value="Pollination">Pollination</SelectItem>
                                    <SelectItem value="Fruit/Grain/Bulb Formation">Formation</SelectItem>
                                    <SelectItem value="Maturation">Maturation</SelectItem>
                                    <SelectItem value="Harvest">Harvest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-medium shadow-lg hover:shadow-primary/20"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving Profile..." : "Get Started"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
