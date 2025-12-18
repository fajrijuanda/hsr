"use client";

import { useBattleStore } from "@/stores/battleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import charactersData from "@/data/characters.json";
import enemiesData from "@/data/enemies.json";
import { Character, Enemy } from "@/types";

const characters = charactersData as Character[];
const enemies = enemiesData as Enemy[];

// Only characters with skill data
const AVAILABLE_CHARS = ["acheron", "sparkle", "jiaoqiu", "firefly", "seele", "dan_heng_il", "fu_xuan", "ruan_mei"];

export function BattleSetup() {
    const { initBattle, phase, resetBattle } = useBattleStore();
    const [selectedChars, setSelectedChars] = useState<string[]>([]);
    const [selectedEnemy, setSelectedEnemy] = useState("phantylia");
    const [bossHp, setBossHp] = useState(1000000);

    const toggleChar = (charId: string) => {
        if (selectedChars.includes(charId)) {
            setSelectedChars(selectedChars.filter(c => c !== charId));
        } else if (selectedChars.length < 4) {
            setSelectedChars([...selectedChars, charId]);
        }
    };

    const startBattle = () => {
        const enemy = enemies.find(e => e.id === selectedEnemy);
        initBattle(selectedChars, {
            id: selectedEnemy,
            name: enemy?.name || "Boss",
            maxHp: bossHp,
            speed: enemy?.speed || 80,
            weakness: (enemy?.weakness || ["Lightning"]) as ("Physical" | "Fire" | "Ice" | "Lightning" | "Wind" | "Quantum" | "Imaginary")[],
            def: enemy?.def || 1000,
        });
    };

    const availableChars = characters.filter(c => AVAILABLE_CHARS.includes(c.id));

    if (phase !== "setup") {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="py-4">
                    <Button onClick={resetBattle} variant="outline" className="w-full">
                        🔄 Reset Battle
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">⚙️ Battle Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Character Selection */}
                <div>
                    <h3 className="text-sm text-gray-400 mb-2">
                        Select Team ({selectedChars.length}/4)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {availableChars.map((char) => {
                            const isSelected = selectedChars.includes(char.id);
                            const order = selectedChars.indexOf(char.id) + 1;
                            return (
                                <Button
                                    key={char.id}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleChar(char.id)}
                                    disabled={!isSelected && selectedChars.length >= 4}
                                    className={`
                    justify-start relative
                    ${isSelected ? "bg-purple-600/50 border-purple-500" : "bg-gray-800/50"}
                  `}
                                >
                                    {isSelected && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-600">
                                            {order}
                                        </Badge>
                                    )}
                                    {char.name}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Enemy Selection */}
                <div>
                    <h3 className="text-sm text-gray-400 mb-2">Select Enemy</h3>
                    <Select value={selectedEnemy} onValueChange={setSelectedEnemy}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            {enemies.map((enemy) => (
                                <SelectItem key={enemy.id} value={enemy.id}>
                                    {enemy.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Boss HP */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Boss HP</span>
                        <span className="text-white font-mono">
                            {(bossHp / 1000000).toFixed(1)}M
                        </span>
                    </div>
                    <Slider
                        value={[bossHp]}
                        onValueChange={([val]) => setBossHp(val)}
                        min={500000}
                        max={5000000}
                        step={100000}
                    />
                </div>

                {/* Start Button */}
                <Button
                    onClick={startBattle}
                    disabled={selectedChars.length === 0}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                >
                    ⚔️ Start Battle
                </Button>
            </CardContent>
        </Card>
    );
}
