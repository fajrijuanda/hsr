"use client";

import { useBattleStore } from "@/stores/battleStore";
import { canUseUltimate } from "@/lib/battle-engine";
import { Button } from "@/components/ui/button";

export function ActionBar() {
    const { performAction, getActiveCharacter, phase } = useBattleStore();
    const activeChar = getActiveCharacter();

    if (!activeChar || phase !== "battle") {
        return null;
    }

    const ultReady = canUseUltimate(activeChar);

    return (
        <div className="p-4 rounded-lg bg-gray-900/80 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                    {activeChar.name}&apos;s Turn
                </span>
                <span className="text-xs text-gray-500">
                    Select an action
                </span>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={() => performAction("basic")}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                    <span className="text-lg mr-2">⚔️</span>
                    Basic ATK
                </Button>

                <Button
                    onClick={() => performAction("skill")}
                    variant="outline"
                    className="flex-1 bg-blue-900/30 border-blue-500/50 hover:bg-blue-900/50 text-blue-300"
                >
                    <span className="text-lg mr-2">✨</span>
                    Skill
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
                    Ultimate
                    {ultReady && <span className="ml-1">✓</span>}
                </Button>
            </div>
        </div>
    );
}
