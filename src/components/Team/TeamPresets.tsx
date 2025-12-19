"use client";

import { useState, useEffect, useCallback } from "react";
import { useTeamStore } from "@/stores/teamStore";
import { useUser } from "@/context/UserContext";
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
    const { team, loadPreset } = useTeamStore();
    const { uid } = useUser();
    const [userPresets, setUserPresets] = useState<any[]>([]);

    const fetchPresets = useCallback(async () => {
        try {
            const res = await fetch(`/api/user/team-presets?uid=${uid}`);
            const data = await res.json();
            if (data.success) {
                setUserPresets(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    }, [uid]);

    useEffect(() => {
        if (!uid) return;
        fetchPresets();
    }, [uid, fetchPresets]);

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this preset?")) return;
        try {
            await fetch(`/api/user/team-presets?id=${id}&uid=${uid}`, { method: "DELETE" });
            fetchPresets();
        } catch (error) {
            console.error(error);
        }
    };

    const isActive = (characterIds: string[]) => {
        if (team.length !== characterIds.length) return false;
        return characterIds.every(id =>
            team.some(m => m.character.id === id)
        );
    };

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Team Presets</CardTitle>
            </CardHeader>
            <CardContent>
                {/* User Presets */}
                {userPresets.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Your Custom Presets</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {userPresets.map((preset) => {
                                const presetCharIds = (preset.characters as any[]).map(c => c.characterId || c.id); // Handle simplified or full objects
                                const active = isActive(presetCharIds);
                                return (
                                    <div key={preset.id} className="relative group">
                                        <Button
                                            variant={active ? "default" : "outline"}
                                            className={`
                                                w-full h-auto py-3 px-4 flex flex-col items-start gap-1
                                                ${active
                                                    ? "bg-purple-600/30 border-purple-500"
                                                    : "bg-gray-800/30 border-gray-700 hover:bg-gray-700/50"
                                                }
                                            `}
                                            onClick={() => loadPreset(presetCharIds)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <span className="font-semibold">{preset.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-gray-800/50 ml-auto"
                                                >
                                                    Custom
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-400 text-left">
                                                {presetCharIds.length} Characters
                                            </span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(preset.id);
                                            }}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Featured Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PRESETS.map((preset) => {
                        const active = isActive(preset.characterIds);
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
