"use client";

import { Character } from "@/types";
import { useTeamStore } from "@/stores/teamStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import charactersData from "@/data/characters.json";

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "bg-gray-400",
    Fire: "bg-red-500",
    Ice: "bg-cyan-400",
    Lightning: "bg-purple-500",
    Wind: "bg-emerald-400",
    Quantum: "bg-indigo-500",
    Imaginary: "bg-yellow-400",
};

const PATH_ICONS: Record<string, string> = {
    Destruction: "⚔️",
    Hunt: "🎯",
    Erudition: "📚",
    Harmony: "🎵",
    Nihility: "💀",
    Preservation: "🛡️",
    Abundance: "💚",
};

export function CharacterPicker() {
    const { team, addCharacter } = useTeamStore();
    const characters = charactersData as Character[];

    const isInTeam = (id: string) => team.some(m => m.character.id === id);
    const canAddMore = team.length < 4;

    // Group by path
    const grouped = characters.reduce((acc, char) => {
        if (!acc[char.path]) acc[char.path] = [];
        acc[char.path].push(char);
        return acc;
    }, {} as Record<string, Character[]>);

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span>Select Characters</span>
                    <Badge variant="outline" className="ml-auto">
                        {team.length}/4
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(grouped).map(([path, chars]) => (
                    <div key={path}>
                        <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                            <span>{PATH_ICONS[path]}</span>
                            <span>{path}</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {chars.map((char) => {
                                const inTeam = isInTeam(char.id);
                                return (
                                    <Button
                                        key={char.id}
                                        variant={inTeam ? "default" : "outline"}
                                        size="sm"
                                        disabled={inTeam || !canAddMore}
                                        onClick={() => addCharacter(char.id)}
                                        className={`
                      relative overflow-hidden
                      ${inTeam ? "bg-purple-600/50" : "bg-gray-800/50 hover:bg-gray-700/50"}
                      border ${inTeam ? "border-purple-500" : "border-gray-600"}
                    `}
                                    >
                                        <span className={`w-2 h-2 rounded-full mr-2 ${ELEMENT_COLORS[char.element]}`} />
                                        {char.name}
                                        <span className="text-xs text-gray-400 ml-1">
                                            ({char.baseSpeed})
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
