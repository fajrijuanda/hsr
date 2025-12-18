"use client";

import { useTeamStore, useTeamStats } from "@/stores/teamStore";
import { calculateAV, getActionsPerCycle } from "@/lib/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "bg-gray-400",
    Fire: "bg-red-500",
    Ice: "bg-cyan-400",
    Lightning: "bg-purple-500",
    Wind: "bg-emerald-400",
    Quantum: "bg-indigo-500",
    Imaginary: "bg-yellow-400",
};

export function TeamBuilder() {
    const { team, removeCharacter, updateMemberSpeed, clearTeam } = useTeamStore();
    const teamStats = useTeamStats();

    if (team.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="py-8 text-center text-gray-500">
                    <p>Select characters from the picker above</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Your Team</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearTeam} className="text-red-400 hover:text-red-300">
                    Clear All
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {teamStats.map((member, index) => {
                    const av = calculateAV(member.totalSpeed);
                    const actionsPerCycle = getActionsPerCycle(member.totalSpeed);

                    return (
                        <div
                            key={member.character.id}
                            className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-4"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${ELEMENT_COLORS[member.character.element]}`} />
                                    <span className="font-semibold">{member.character.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                        Base: {member.character.baseSpeed}
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCharacter(index)}
                                    className="text-gray-400 hover:text-red-400"
                                >
                                    ✕
                                </Button>
                            </div>

                            {/* Stats Display */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-2 rounded bg-gray-900/50">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {member.totalSpeed}
                                    </div>
                                    <div className="text-xs text-gray-500">Total SPD</div>
                                </div>
                                <div className="p-2 rounded bg-gray-900/50">
                                    <div className="text-2xl font-bold text-cyan-400">
                                        {av.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">Action Value</div>
                                </div>
                                <div className="p-2 rounded bg-gray-900/50">
                                    <div className="text-2xl font-bold text-emerald-400">
                                        {actionsPerCycle}
                                    </div>
                                    <div className="text-xs text-gray-500">Acts/Cycle</div>
                                </div>
                            </div>

                            {/* Speed Adjustments */}
                            <div className="space-y-3">
                                {/* Relic Speed Bonus */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Relic Substats</span>
                                        <span>+{member.relicSpeedBonus}</span>
                                    </div>
                                    <Slider
                                        value={[member.relicSpeedBonus]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "relicSpeedBonus", val)}
                                        max={50}
                                        step={1}
                                        className="py-1"
                                    />
                                </div>

                                {/* Light Cone Speed */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Light Cone</span>
                                        <span>+{member.lightConeSpeed}</span>
                                    </div>
                                    <Slider
                                        value={[member.lightConeSpeed]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "lightConeSpeed", val)}
                                        max={30}
                                        step={1}
                                        className="py-1"
                                    />
                                </div>

                                {/* Speed % Bonus */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Speed %</span>
                                        <span>+{member.speedPercent}%</span>
                                    </div>
                                    <Slider
                                        value={[member.speedPercent]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "speedPercent", val)}
                                        max={50}
                                        step={1}
                                        className="py-1"
                                    />
                                </div>

                                {/* Flat Speed Bonus */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Other Flat Bonus</span>
                                        <span>+{member.speedBonus}</span>
                                    </div>
                                    <Slider
                                        value={[member.speedBonus]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "speedBonus", val)}
                                        max={40}
                                        step={1}
                                        className="py-1"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
