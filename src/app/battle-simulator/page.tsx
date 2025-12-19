"use client";

import { motion } from "framer-motion";
import { useBattleStore } from "@/stores/battleStore";
import { EnemyDisplay } from "@/components/Battle/EnemyDisplay";
import { CharacterCard } from "@/components/Battle/CharacterCard";
import { ActionBar } from "@/components/Battle/ActionBar";
import { BattleLog } from "@/components/Battle/BattleLog";
import { BattleSetup } from "@/components/Battle/BattleSetup";
import { formatDamage } from "@/lib/battle-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { useEffect, useRef } from "react";

export default function BattleSimulatorPage() {
    const { phase, team, enemy, battleLog, totalDamage, turn, currentActorId, resetBattle, skillPoints, maxSkillPoints } = useBattleStore();
    const { uid } = useUser();
    const loggedRef = useRef(false);

    // Log battle result when finished
    useEffect(() => {
        if (!uid || (phase !== "victory" && phase !== "defeat")) {
            loggedRef.current = false;
            return;
        }

        if (loggedRef.current) return;

        const logBattle = async () => {
            try {
                loggedRef.current = true;
                await fetch("/api/user/battles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid,
                        team: team.map(c => c.name), // Simplified logging
                        enemy: enemy?.name || "Unknown",
                        result: phase,
                        totalDamage,
                        turns: turn,
                        duration: 0
                    })
                });
            } catch (error) {
                console.error("Failed to log battle", error);
                loggedRef.current = false;
            }
        };

        logBattle();
    }, [phase, uid, team, enemy, totalDamage, turn]);

    return (
        <div className="min-h-screen">
            {/* Header */}


            <div className="container mx-auto px-4 py-8 space-y-4">
                {/* Battle Status Bar */}
                {phase !== "setup" && (
                    <div className="flex justify-end items-center gap-2 mb-2 sticky top-16 z-40 py-2 bg-gradient-to-b from-gray-950/80 to-transparent backdrop-blur-sm -mx-4 px-4 sm:mx-0 sm:px-0 rounded-b-xl">
                        {phase === "battle" && (
                            <>
                                <Badge variant="outline" className="bg-gray-800/50">
                                    Turn {turn}
                                </Badge>
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                    SP: {skillPoints}/{maxSkillPoints}
                                </Badge>
                            </>
                        )}
                        <Badge
                            className={
                                phase === "victory" ? "bg-emerald-500/20 text-emerald-400" :
                                    phase === "defeat" ? "bg-red-500/20 text-red-400" :
                                        phase === "battle" ? "bg-orange-500/20 text-orange-400" :
                                            "bg-gray-500/20 text-gray-400"
                            }
                        >
                            {phase.toUpperCase()}
                        </Badge>
                    </div>
                )}
                {/* Victory/Defeat Screen */}
                {(phase === "victory" || phase === "defeat") && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    >
                        <div className="text-center p-8 rounded-xl bg-gray-900 border border-gray-700 max-w-md">
                            <h2 className={`text-4xl font-bold mb-4 ${phase === "victory" ? "text-emerald-400" : "text-red-400"}`}>
                                {phase === "victory" ? "🎉 VICTORY!" : "💀 DEFEAT"}
                            </h2>
                            <div className="space-y-2 mb-6">
                                <p className="text-gray-400">Total Damage Dealt:</p>
                                <p className="text-3xl font-bold text-white font-mono">
                                    {formatDamage(totalDamage)}
                                </p>
                                <p className="text-gray-400">Turns: {turn}</p>
                            </div>
                            <Button onClick={resetBattle} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    </motion.div>
                )}

                {phase === "setup" ? (
                    /* Setup Mode - Centered */
                    <div className="max-w-md mx-auto">
                        <BattleSetup />
                        <div className="mt-8 h-64 flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-800">
                            <div className="text-center">
                                <p className="text-4xl mb-4">⚔️</p>
                                <p className="text-gray-400">Select your team and enemy to begin</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Battle Mode - Full Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Column - Setup & Log */}
                        <div className="flex flex-col gap-6">
                            <BattleSetup />
                            {/* Battle Log - fills remaining space */}
                            <div className="flex-1 min-h-0">
                                <BattleLog entries={battleLog} maxHeight="calc(100vh - 420px)" />
                            </div>
                        </div>

                        {/* Main Battle Area */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Enemy */}
                            {enemy && <EnemyDisplay enemy={enemy} />}

                            {/* Turn Order */}
                            {phase === "battle" && (
                                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                                    <div className="flex items-center gap-2 text-sm flex-wrap">
                                        <span className="text-gray-400">Turn Order:</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {team.map((char) => (
                                                <Badge
                                                    key={char.id}
                                                    variant={currentActorId === char.id ? "default" : "outline"}
                                                    className={currentActorId === char.id ? "bg-white text-black" : ""}
                                                >
                                                    {char.name}
                                                </Badge>
                                            ))}
                                            {enemy && (
                                                <Badge
                                                    variant={currentActorId === enemy.id ? "default" : "outline"}
                                                    className={currentActorId === enemy.id ? "bg-red-600 text-white" : "text-red-400 border-red-500/50"}
                                                >
                                                    {enemy.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {team.map((char) => (
                                    <CharacterCard
                                        key={char.id}
                                        character={char}
                                        isActive={currentActorId === char.id}
                                    />
                                ))}
                            </div>

                            {/* Action Bar */}
                            {phase === "battle" && <ActionBar />}

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
                                    <div className="text-sm text-gray-400">Total Damage</div>
                                    <div className="text-2xl font-bold text-white font-mono">
                                        {formatDamage(totalDamage)}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
                                    <div className="text-sm text-gray-400">Turn</div>
                                    <div className="text-2xl font-bold text-white">
                                        {turn}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
                                    <div className="text-sm text-gray-400">DPT (Avg)</div>
                                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                                        {turn > 0 ? formatDamage(Math.floor(totalDamage / turn)) : "0"}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 text-center">
                                    <div className="text-sm text-gray-400">Actions</div>
                                    <div className="text-2xl font-bold text-white">
                                        {battleLog.filter(e => e.damage).length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center text-sm text-gray-500 pt-8 mt-8 border-t border-gray-800">
                    <p>Select actions to deal damage to the enemy. Ultimate becomes available when energy is full.</p>
                    <p className="mt-1">Damage calculated using approximate HSR formulas.</p>
                </footer>
            </div>
        </div>
    );
}
