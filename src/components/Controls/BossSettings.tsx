"use client";

import { useTeamStore } from "@/stores/teamStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function BossSettings() {
    const { cycles, bossSpeed, setCycles, setBossSpeed } = useTeamStore();

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Battle Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cycles */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cycles to Display</span>
                        <span className="font-semibold">{cycles}</span>
                    </div>
                    <Select
                        value={cycles.toString()}
                        onValueChange={(val) => setCycles(parseInt(val))}
                    >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="2">2 Cycles</SelectItem>
                            <SelectItem value="3">3 Cycles (MoC Standard)</SelectItem>
                            <SelectItem value="4">4 Cycles</SelectItem>
                            <SelectItem value="5">5 Cycles</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Boss Speed */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Boss Speed</span>
                        <span className="font-semibold">{bossSpeed}</span>
                    </div>
                    <Slider
                        value={[bossSpeed]}
                        onValueChange={([val]) => setBossSpeed(val)}
                        min={50}
                        max={150}
                        step={5}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Slow (50)</span>
                        <span>Fast (150)</span>
                    </div>
                </div>

                {/* Quick Boss Presets */}
                <div className="space-y-2">
                    <span className="text-sm text-gray-400">Boss Presets</span>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { name: "MoC Boss", speed: 80 },
                            { name: "PF Boss", speed: 90 },
                            { name: "Fast Elite", speed: 120 },
                            { name: "Slow Boss", speed: 60 },
                        ].map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => setBossSpeed(preset.speed)}
                                className={`
                  py-2 px-3 rounded text-sm
                  ${bossSpeed === preset.speed
                                        ? "bg-purple-600/30 border border-purple-500 text-purple-300"
                                        : "bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50"
                                    }
                `}
                            >
                                {preset.name}
                                <span className="ml-1 text-xs opacity-70">({preset.speed})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
