"use client";

import { useTeamStore } from "@/stores/teamStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Preset {
    id: string;
    name: string;
    description: string;
    characterIds: string[];
    tags: string[];
}

const PRESETS: Preset[] = [
    {
        id: "acheron",
        name: "Acheron Team",
        description: "Stack debuffs for Acheron's ultimate",
        characterIds: ["acheron", "jiaoqiu", "pela", "fu_xuan"],
        tags: ["Meta", "Debuff"],
    },
    {
        id: "firefly",
        name: "Super Break",
        description: "Firefly break team with Ruan Mei",
        characterIds: ["firefly", "ruan_mei", "trailblazer_harmony", "gallagher"],
        tags: ["Meta", "Break"],
    },
    {
        id: "dhil",
        name: "Dan Heng IL Hypercarry",
        description: "Classic DHIL hypercarry with Sparkle",
        characterIds: ["dan_heng_il", "sparkle", "ruan_mei", "fu_xuan"],
        tags: ["Hypercarry"],
    },
    {
        id: "seele",
        name: "Seele Speed",
        description: "Fast Seele with action advance",
        characterIds: ["seele", "sparkle", "bronya", "fu_xuan"],
        tags: ["Speed", "Hunt"],
    },
    {
        id: "kafka",
        name: "Kafka DoT",
        description: "Damage over time team",
        characterIds: ["kafka", "silver_wolf", "ruan_mei", "aventurine"],
        tags: ["DoT", "Nihility"],
    },
    {
        id: "robin",
        name: "Robin FuA",
        description: "Follow-up attack synergy",
        characterIds: ["robin", "aventurine", "ruan_mei", "acheron"],
        tags: ["FuA", "Harmony"],
    },
];

export function TeamPresets() {
    const { loadPreset, team } = useTeamStore();

    const isActive = (preset: Preset) => {
        if (team.length !== preset.characterIds.length) return false;
        return preset.characterIds.every(id =>
            team.some(m => m.character.id === id)
        );
    };

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Team Presets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PRESETS.map((preset) => {
                        const active = isActive(preset);
                        return (
                            <Button
                                key={preset.id}
                                variant={active ? "default" : "outline"}
                                className={`
                  h-auto py-3 px-4 flex flex-col items-start gap-1
                  ${active
                                        ? "bg-purple-600/30 border-purple-500"
                                        : "bg-gray-800/30 border-gray-700 hover:bg-gray-700/50"
                                    }
                `}
                                onClick={() => loadPreset(preset.characterIds)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className="font-semibold">{preset.name}</span>
                                    <div className="flex gap-1 ml-auto">
                                        {preset.tags.map(tag => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="text-xs bg-gray-800/50"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 text-left">
                                    {preset.description}
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
