"use client";

import Image from "next/image";
import { useTeamStore, useTeamStats } from "@/stores/teamStore";
import { calculateAV, getActionsPerCycle } from "@/lib/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STAR_RAIL_RES_CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

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

    const getCharacterAvatarUrl = (charId: string) => {
        return `${STAR_RAIL_RES_CDN}/icon/character/${charId}.png`;
    };

    if (team.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="py-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="font-medium">No characters selected</p>
                    <p className="text-sm mt-1">Pick characters from the left panel</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Your Team</CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTeam}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                    Clear All
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {teamStats.map((member, index) => {
                    const av = calculateAV(member.totalSpeed);
                    const actionsPerCycle = getActionsPerCycle(member.totalSpeed);

                    return (
                        <div
                            key={member.character.id}
                            className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 space-y-3"
                        >
                            {/* Header with Avatar */}
                            <div className="flex items-center gap-3">
                                {/* Character Avatar */}
                                <div className={`
                  relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0
                  ${member.character.rarity === 5 ? "ring-2 ring-yellow-500/50" : "ring-2 ring-purple-500/50"}
                `}>
                                    <Image
                                        src={getCharacterAvatarUrl(member.character.charId)}
                                        alt={member.character.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-tl ${ELEMENT_COLORS[member.character.element]}`}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold truncate">{member.character.name}</span>
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            Base: {member.character.baseSpeed}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {member.character.path}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCharacter(index)}
                                    className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                                >
                                    ✕
                                </Button>
                            </div>

                            {/* Stats Display - Compact Row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/30">
                                    <div className="text-xl font-bold text-purple-400">
                                        {member.totalSpeed}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">SPD</div>
                                </div>
                                <div className="p-2 rounded bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-700/30">
                                    <div className="text-xl font-bold text-cyan-400">
                                        {av.toFixed(1)}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">AV</div>
                                </div>
                                <div className="p-2 rounded bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/30">
                                    <div className="text-xl font-bold text-emerald-400">
                                        {actionsPerCycle}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Acts</div>
                                </div>
                            </div>

                            {/* Speed Adjustments - Compact */}
                            <div className="space-y-2">
                                {/* Relic Speed */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20">Relic Sub</span>
                                    <Slider
                                        value={[member.relicSpeedBonus]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "relicSpeedBonus", val)}
                                        max={50}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-300 w-10 text-right">+{member.relicSpeedBonus}</span>
                                </div>

                                {/* Light Cone */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20">Light Cone</span>
                                    <Slider
                                        value={[member.lightConeSpeed]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "lightConeSpeed", val)}
                                        max={30}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-300 w-10 text-right">+{member.lightConeSpeed}</span>
                                </div>

                                {/* Speed % */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20">Speed %</span>
                                    <Slider
                                        value={[member.speedPercent]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "speedPercent", val)}
                                        max={50}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-300 w-10 text-right">+{member.speedPercent}%</span>
                                </div>

                                {/* Flat Bonus */}
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20">Flat Bonus</span>
                                    <Slider
                                        value={[member.speedBonus]}
                                        onValueChange={([val]) => updateMemberSpeed(index, "speedBonus", val)}
                                        max={40}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-gray-300 w-10 text-right">+{member.speedBonus}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
