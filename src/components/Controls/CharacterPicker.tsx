"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Character } from "@/types";
import { useTeamStore } from "@/stores/teamStore";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import charactersData from "@/data/characters.json";

const STAR_RAIL_RES_CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

const ELEMENT_CONFIG: Record<string, { color: string; bgClass: string }> = {
    Physical: { color: "#808080", bgClass: "bg-gray-500" },
    Fire: { color: "#f43f5e", bgClass: "bg-red-500" },
    Ice: { color: "#22d3ee", bgClass: "bg-cyan-400" },
    Lightning: { color: "#a855f7", bgClass: "bg-purple-500" },
    Wind: { color: "#34d399", bgClass: "bg-emerald-400" },
    Quantum: { color: "#6366f1", bgClass: "bg-indigo-500" },
    Imaginary: { color: "#facc15", bgClass: "bg-yellow-400" },
};

const PATH_CONFIG: Record<string, { icon: string; label: string }> = {
    Destruction: { icon: "⚔️", label: "Destruction" },
    Hunt: { icon: "🎯", label: "Hunt" },
    Erudition: { icon: "📚", label: "Erudition" },
    Harmony: { icon: "🎵", label: "Harmony" },
    Nihility: { icon: "💀", label: "Nihility" },
    Preservation: { icon: "🛡️", label: "Preservation" },
    Abundance: { icon: "💚", label: "Abundance" },
    Remembrance: { icon: "🦋", label: "Remembrance" },
};

type FilterTab = "all" | "owned";

export function CharacterPicker() {
    const { team, addCharacter } = useTeamStore();
    const { profile } = useUser();
    const characters = charactersData as Character[];

    const [search, setSearch] = useState("");
    const [filterTab, setFilterTab] = useState<FilterTab>("all");
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const isInTeam = (id: string) => team.some((m) => m.character.id === id);
    const canAddMore = team.length < 4;

    // Get owned character IDs from showcase
    const ownedCharacterIds = useMemo(() => {
        if (!profile?.characters) return new Set<string>();
        return new Set(profile.characters.map((c) => c.id));
    }, [profile]);

    // Filter characters based on all criteria
    const filteredCharacters = useMemo(() => {
        return characters.filter((char) => {
            // Search filter
            if (search && !char.name.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }

            // Owned filter
            if (filterTab === "owned" && !ownedCharacterIds.has(char.charId)) {
                return false;
            }

            // Element filter
            if (selectedElement && char.element !== selectedElement) {
                return false;
            }

            // Path filter
            if (selectedPath && char.path !== selectedPath) {
                return false;
            }

            return true;
        });
    }, [characters, search, filterTab, ownedCharacterIds, selectedElement, selectedPath]);

    // Group by path for display
    const groupedByPath = useMemo(() => {
        const grouped: Record<string, Character[]> = {};
        for (const char of filteredCharacters) {
            if (!grouped[char.path]) grouped[char.path] = [];
            grouped[char.path].push(char);
        }
        return grouped;
    }, [filteredCharacters]);

    const getCharacterAvatarUrl = (charId: string) => {
        return `${STAR_RAIL_RES_CDN}/icon/character/${charId}.png`;
    };

    const elements = Object.keys(ELEMENT_CONFIG);
    const paths = Object.keys(PATH_CONFIG);

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
                {/* Search */}
                <Input
                    placeholder="Search characters..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-gray-800/50 border-gray-600"
                />

                {/* Tabs: All / My Characters */}
                <div className="flex gap-2">
                    <Button
                        variant={filterTab === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterTab("all")}
                        className={filterTab === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                        All ({characters.length})
                    </Button>
                    <Button
                        variant={filterTab === "owned" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterTab("owned")}
                        className={filterTab === "owned" ? "bg-purple-600 hover:bg-purple-700" : ""}
                        disabled={!profile}
                    >
                        My Characters ({ownedCharacterIds.size})
                    </Button>
                </div>

                {/* Element Filters */}
                <div className="flex flex-wrap gap-1">
                    {elements.map((element) => (
                        <Button
                            key={element}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedElement(selectedElement === element ? null : element)}
                            className={`px-2 py-1 h-7 ${selectedElement === element
                                    ? `${ELEMENT_CONFIG[element].bgClass} text-white`
                                    : "bg-gray-800/50 hover:bg-gray-700/50"
                                }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full mr-1 ${ELEMENT_CONFIG[element].bgClass}`}
                            />
                            {element}
                        </Button>
                    ))}
                </div>

                {/* Path Filters */}
                <div className="flex flex-wrap gap-1">
                    {paths.map((path) => (
                        <Button
                            key={path}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPath(selectedPath === path ? null : path)}
                            className={`px-2 py-1 h-7 ${selectedPath === path
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-800/50 hover:bg-gray-700/50"
                                }`}
                        >
                            <span className="mr-1">{PATH_CONFIG[path].icon}</span>
                            {path}
                        </Button>
                    ))}
                </div>

                {/* Character Grid */}
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                    {Object.entries(groupedByPath).map(([path, chars]) => (
                        <div key={path}>
                            <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-1 sticky top-0 bg-gray-900/90 py-1">
                                <span>{PATH_CONFIG[path]?.icon}</span>
                                <span>{path}</span>
                                <span className="text-gray-500 ml-1">({chars.length})</span>
                            </h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                {chars.map((char) => {
                                    const inTeam = isInTeam(char.id);
                                    const isOwned = ownedCharacterIds.has(char.charId);

                                    return (
                                        <button
                                            key={char.id}
                                            disabled={inTeam || !canAddMore}
                                            onClick={() => addCharacter(char.id)}
                                            className={`
                        relative group rounded-lg overflow-hidden transition-all duration-200
                        ${inTeam
                                                    ? "ring-2 ring-purple-500 opacity-50"
                                                    : canAddMore
                                                        ? "hover:ring-2 hover:ring-purple-400 hover:scale-105"
                                                        : "opacity-50 cursor-not-allowed"
                                                }
                        ${isOwned && filterTab === "all" ? "ring-1 ring-emerald-500/50" : ""}
                      `}
                                            title={`${char.name} (${char.baseSpeed} SPD)`}
                                        >
                                            {/* Character Avatar */}
                                            <div className={`
                        aspect-square bg-gradient-to-br from-gray-800 to-gray-900
                        ${char.rarity === 5 ? "border-b-2 border-yellow-500" : "border-b-2 border-purple-500"}
                      `}>
                                                <Image
                                                    src={getCharacterAvatarUrl(char.charId)}
                                                    alt={char.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                                {/* Element Badge */}
                                                <div
                                                    className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full ${ELEMENT_CONFIG[char.element]?.bgClass}`}
                                                />
                                                {/* In Team Overlay */}
                                                {inTeam && (
                                                    <div className="absolute inset-0 bg-purple-600/50 flex items-center justify-center">
                                                        <span className="text-white text-lg">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Name & Speed */}
                                            <div className="p-1 bg-gray-800/90 text-center">
                                                <div className="text-xs text-gray-200 truncate">{char.name}</div>
                                                <div className="text-[10px] text-gray-500">{char.baseSpeed} SPD</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredCharacters.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {filterTab === "owned" && !profile ? (
                                <p>Login with your UID to see your characters</p>
                            ) : (
                                <p>No characters match your filters</p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
