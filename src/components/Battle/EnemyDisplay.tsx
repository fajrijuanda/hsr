"use client";

import { motion } from "framer-motion";
import { BattleEnemy } from "@/types";
import { getHpPercent, formatDamage } from "@/lib/battle-engine";
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

interface EnemyDisplayProps {
    enemy: BattleEnemy;
}

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
    const hpPercent = getHpPercent(enemy.currentHp, enemy.maxHp);
    const isLowHp = hpPercent < 30;

    return (
        <div className="p-6 rounded-xl bg-gradient-to-br from-red-900/30 to-gray-900 border border-red-500/30">
            {/* Enemy Name & Status */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{enemy.name}</h3>
                    <div className="flex gap-1 mt-1">
                        {enemy.weakness.map((element) => (
                            <Badge
                                key={element}
                                className={`${ELEMENT_COLORS[element]} text-white text-xs`}
                            >
                                {element}
                            </Badge>
                        ))}
                    </div>
                </div>
                {enemy.isBroken && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                        BROKEN
                    </Badge>
                )}
            </div>

            {/* HP Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">HP</span>
                    <span className={isLowHp ? "text-red-400" : "text-white"}>
                        {formatDamage(enemy.currentHp)} / {formatDamage(enemy.maxHp)}
                    </span>
                </div>
                <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${isLowHp ? "bg-red-500" : "bg-gradient-to-r from-red-600 to-red-400"}`}
                        initial={{ width: "100%" }}
                        animate={{ width: `${hpPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="text-center text-sm text-gray-500">
                    {hpPercent}% remaining
                </div>
            </div>

            {/* Debuffs */}
            {enemy.effects.length > 0 && (
                <div className="mt-4">
                    <span className="text-xs text-gray-400">Debuffs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {enemy.effects.map((effect) => (
                            <Badge
                                key={effect.id}
                                variant="outline"
                                className="text-xs bg-red-900/30 border-red-500/50 text-red-400"
                            >
                                {effect.name} ({effect.duration}t)
                                {effect.stacks > 1 && ` x${effect.stacks}`}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                <div className="p-2 rounded bg-gray-800/50">
                    <div className="text-gray-400">DEF</div>
                    <div className="text-white font-mono">{enemy.def}</div>
                </div>
                <div className="p-2 rounded bg-gray-800/50">
                    <div className="text-gray-400">SPD</div>
                    <div className="text-white font-mono">{enemy.speed}</div>
                </div>
                <div className="p-2 rounded bg-gray-800/50">
                    <div className="text-gray-400">Toughness</div>
                    <div className="text-white font-mono">{enemy.toughness}/{enemy.maxToughness}</div>
                </div>
            </div>
        </div>
    );
}
