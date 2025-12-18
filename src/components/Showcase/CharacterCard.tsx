"use client";

import { ShowcaseCharacter } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOverallBuildRating } from "@/lib/rater";

interface CharacterCardProps {
    character: ShowcaseCharacter;
    onClick?: () => void;
    isSelected?: boolean;
}

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "from-gray-400 to-gray-500",
    Fire: "from-red-500 to-orange-500",
    Ice: "from-cyan-400 to-blue-500",
    Lightning: "from-purple-500 to-violet-600",
    Wind: "from-emerald-400 to-green-500",
    Quantum: "from-indigo-500 to-purple-600",
    Imaginary: "from-yellow-400 to-amber-500",
};

const ELEMENT_ICONS: Record<string, string> = {
    Physical: "⚪",
    Fire: "🔥",
    Ice: "❄️",
    Lightning: "⚡",
    Wind: "🌪️",
    Quantum: "🔮",
    Imaginary: "✨",
};

const PATH_ICONS: Record<string, string> = {
    Destruction: "⚔️",
    Hunt: "🎯",
    Erudition: "📚",
    Harmony: "🎵",
    Nihility: "🌑",
    Preservation: "🛡️",
    Abundance: "💚",
    Remembrance: "🦋",
};

const GRADE_COLORS: Record<string, string> = {
    S: "bg-yellow-500 text-black",
    A: "bg-purple-500 text-white",
    B: "bg-blue-500 text-white",
    C: "bg-green-500 text-white",
    D: "bg-gray-500 text-white",
    F: "bg-red-600 text-white",
};

export function ShowcaseCharacterCard({ character, onClick, isSelected }: CharacterCardProps) {
    const buildRating = getOverallBuildRating(
        character.relics.map(r => ({
            id: r.id,
            slot: r.slot,
            setName: r.setName,
            level: r.level,
            mainStat: r.mainStat,
            substats: r.substats,
        })),
        character.id
    );

    const elementGradient = ELEMENT_COLORS[character.element] || "from-gray-500 to-gray-600";

    return (
        <Card
            className={`
                relative overflow-hidden cursor-pointer transition-all hover:scale-105
                ${isSelected ? "ring-2 ring-purple-500" : ""}
                bg-gradient-to-br ${elementGradient} bg-opacity-20
            `}
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gray-900/80" />
            <CardContent className="relative p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{ELEMENT_ICONS[character.element]}</span>
                        <div>
                            <h3 className="font-bold text-white">{character.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>{PATH_ICONS[character.path]}</span>
                                <span>Lv.{character.level}</span>
                                <span className="text-yellow-400">E{character.eidolon}</span>
                            </div>
                        </div>
                    </div>
                    <Badge className={`${GRADE_COLORS[buildRating.grade]} font-bold`}>
                        {buildRating.grade}
                    </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="flex justify-between">
                        <span className="text-gray-400">HP</span>
                        <span className="text-white font-mono">{character.stats.hp.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">SPD</span>
                        <span className="text-white font-mono">{character.stats.spd}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">ATK</span>
                        <span className="text-white font-mono">{character.stats.atk.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">DEF</span>
                        <span className="text-white font-mono">{character.stats.def}</span>
                    </div>
                </div>

                {/* CRIT Stats */}
                <div className="flex items-center justify-center gap-4 py-2 px-3 rounded bg-black/30">
                    <div className="text-center">
                        <div className="text-[10px] text-gray-400">CRIT Rate</div>
                        <div className="text-sm font-bold text-cyan-400">
                            {character.stats.critRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className="text-gray-600">/</div>
                    <div className="text-center">
                        <div className="text-[10px] text-gray-400">CRIT DMG</div>
                        <div className="text-sm font-bold text-orange-400">
                            {character.stats.critDmg.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Light Cone */}
                {character.lightCone && (
                    <div className="mt-3 text-xs text-center text-gray-400">
                        <span className="text-yellow-400">S{character.lightCone.superimposition}</span>
                        {" "}{character.lightCone.name}
                    </div>
                )}

                {/* Build Score */}
                <div className="mt-3 text-xs text-center text-gray-500">
                    Build Score: {buildRating.score}%
                </div>
            </CardContent>
        </Card>
    );
}
