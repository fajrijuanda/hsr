"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BattleLogEntry } from "@/types";
import { formatDamage } from "@/lib/battle-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BattleLogProps {
    entries: BattleLogEntry[];
}

export function BattleLog({ entries }: BattleLogProps) {
    return (
        <Card className="bg-gray-900/50 border-gray-700 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    📜 Battle Log
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-80">
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {entries.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Start the battle to see action log
                            </p>
                        ) : (
                            entries.slice(0, 20).map((entry) => (
                                <motion.div
                                    key={entry.timestamp}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`
                    p-2 rounded text-sm border-l-2
                    ${entry.damage
                                            ? entry.isCrit
                                                ? "bg-yellow-900/20 border-yellow-500"
                                                : "bg-gray-800/50 border-gray-600"
                                            : "bg-gray-800/30 border-gray-700"
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-xs">Turn {entry.turn}</span>
                                        {entry.damage && (
                                            <span className={`font-mono font-bold ${entry.isCrit ? "text-yellow-400" : "text-white"}`}>
                                                {formatDamage(entry.damage)}
                                                {entry.isCrit && " CRIT!"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-white mt-1">
                                        {entry.action}
                                    </div>
                                    {entry.effects && entry.effects.length > 0 && (
                                        <div className="text-xs text-purple-400 mt-1">
                                            → {entry.effects.join(", ")}
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
