export const wheatStages = [
    { name: "Germination", minDay: 1, maxDay: 12 },
    { name: "Tillering", minDay: 13, maxDay: 35 },
    { name: "Stem Extension", minDay: 36, maxDay: 65 },
    { name: "Heading", minDay: 66, maxDay: 85 },
    { name: "Grain Filling", minDay: 86, maxDay: 115 },
    { name: "Ripening", minDay: 116, maxDay: 140 },
];

export function calculateWheatStage(cropAgeDays) {
    const d = Math.max(1, Math.floor(cropAgeDays));
    return (
        wheatStages.find((s) => d >= s.minDay && d <= s.maxDay) ??
        wheatStages[wheatStages.length - 1]
    );
}

export function decisionEngine(args) {
    const { soilMoisture, rainDetected, nutrientLow } = args;

    const waterRequired = soilMoisture < 30;
    const stopIrrigation = soilMoisture > 60 || rainDetected;

    const fertilizerRequired = Boolean(nutrientLow);

    const warnings = [];
    if (rainDetected && soilMoisture < 50) {
        warnings.push("Rain detected — irrigation is paused.");
    }
    if (soilMoisture < 25) warnings.push("Moisture level is critically low.");
    if (soilMoisture > 85) warnings.push("Soil is saturated — watch for runoff.");

    return {
        waterRequired,
        stopIrrigation,
        fertilizerRequired,
        warnings,
    };
}
