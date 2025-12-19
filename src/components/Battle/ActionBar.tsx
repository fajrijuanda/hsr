"use client";

import { useBattleStore } from "@/stores/battleStore";
import { canUseUltimate } from "@/lib/battle-engine";
import { Button } from "@/components/ui/button";

export function ActionBar() {
    const { performAction, getActiveCharacter, phase, skillPoints, maxSkillPoints, canUseSkill } = useBattleStore();
    const activeChar = getActiveCharacter();

    if (!activeChar || phase !== "battle") {
        return null;
    }

    const ultReady = canUseUltimate(activeChar);
    const canSkill = canUseSkill();

    return (
        <div className="p-4 rounded-lg bg-gray-900/80 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                    {activeChar.name}&apos;s Turn
                </span>
                {/* SP Display */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">SP:</span>
                    <div className="flex gap-1">
                        {Array.from({ length: maxSkillPoints }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-colors ${i < skillPoints
                                        ? "bg-yellow-400 shadow-sm shadow-yellow-400/50"
                                        : "bg-gray-700"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => performAction("basic")}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                    <span className="text-lg mr-2">⚔️</span>
                    <div className="flex flex-col items-start">
                        <span>Basic ATK</span>
                        <span className="text-xs text-emerald-400">+1 SP</span>
                    </div>
                </Button>

                <Button
                    onClick={() => performAction("skill")}
                    disabled={!canSkill}
                    variant="outline"
                    className={`flex-1 ${canSkill
                            ? "bg-blue-900/30 border-blue-500/50 hover:bg-blue-900/50 text-blue-300"
                            : "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <span className="text-lg mr-2">✨</span>
                    <div className="flex flex-col items-start">
                        <span>Skill</span>
                        <span className={`text-xs ${canSkill ? "text-red-400" : "text-gray-600"}`}>-1 SP</span>
                    </div>
                </Button>

                <Button
                    onClick={() => performAction("ultimate")}
                    disabled={!ultReady}
                    className={`
            flex-1
            ${ultReady
                            ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }
          `}
                >
                    <span className="text-lg mr-2">💥</span>
                    <div className="flex flex-col items-start">
                        <span>Ultimate</span>
                        <span className="text-xs">{ultReady ? "✓ Ready" : "Not Ready"}</span>
                    </div>
                </Button>
            </div>
        </div>
    );
}

