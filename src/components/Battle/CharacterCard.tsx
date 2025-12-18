"use client";

import { motion } from "framer-motion";
import { BattleCharacter } from "@/types";
import { canUseUltimate, getHpPercent } from "@/lib/battle-engine";
import { Badge } from "@/components/ui/badge";

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "border-gray-400 bg-gray-400/10",
    Fire: "border-red-500 bg-red-500/10",
    Ice: "border-cyan-400 bg-cyan-400/10",
    Lightning: "border-purple-500 bg-purple-500/10",
    Wind: "border-emerald-400 bg-emerald-400/10",
    Quantum: "border-indigo-500 bg-indigo-500/10",
    Imaginary: "border-yellow-400 bg-yellow-400/10",
};

const ELEMENT_DOT_COLORS: Record<string, string> = {
    Physical: "bg-gray-400",
    Fire: "bg-red-500",
    Ice: "bg-cyan-400",
    Lightning: "bg-purple-500",
    Wind: "bg-emerald-400",
    Quantum: "bg-indigo-500",
    Imaginary: "bg-yellow-400",
};

interface CharacterCardProps {
    character: BattleCharacter;
    isActive: boolean;
    onClick?: () => void;
}

export function CharacterCard({ character, isActive, onClick }: CharacterCardProps) {
    const hpPercent = getHpPercent(character.currentHp, character.maxHp);
    const energyPercent = Math.round((character.currentEnergy / character.maxEnergy) * 100);
    const ultReady = canUseUltimate(character);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${ELEMENT_COLORS[character.element]}
        ${isActive ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}
      `}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${ELEMENT_DOT_COLORS[character.element]}`} />
                <span className="font-semibold text-white truncate">{character.name}</span>
                {isActive && (
                    <Badge className="ml-auto bg-white/20 text-white text-xs">
                        ACTIVE
                    </Badge>
                )}
            </div>

            {/* HP Bar */}
            <div className="space-y-1 mb-2">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">HP</span>
                    <span className="text-white">{hpPercent}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
                        style={{ width: `${hpPercent}%` }}
                    />
                </div>
            </div>

            {/* Energy Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Energy</span>
                    <span className={ultReady ? "text-yellow-400 font-bold" : "text-white"}>
                        {Math.floor(character.currentEnergy)}/{character.maxEnergy}
                        {ultReady && " ✓"}
                    </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${ultReady ? "bg-yellow-500" : "bg-gradient-to-r from-blue-600 to-blue-400"}`}
                        animate={{ width: `${energyPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Buffs */}
            {character.effects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {character.effects.slice(0, 3).map((effect) => (
                        <Badge
                            key={effect.id}
                            variant="outline"
                            className="text-xs bg-emerald-900/30 border-emerald-500/50 text-emerald-400"
                        >
                            {effect.name.slice(0, 10)}
                        </Badge>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
