"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useBattleStore } from "@/stores/battleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import charactersData from "@/data/characters.json";
import enemiesData from "@/data/enemies.json";
import skillsData from "@/data/skills.json";
import { Character, Enemy } from "@/types";

const characters = charactersData as Character[];
const enemies = enemiesData as Enemy[];
const skills = skillsData as Record<string, { ultCost: number }>;

// StarRailRes CDN base URL for character icons
const STARRAIL_CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

const getCharacterIcon = (charId: string) =>
    `${STARRAIL_CDN}/icon/character/${charId}.png`;

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "border-gray-400",
    Fire: "border-red-500",
    Ice: "border-cyan-400",
    Lightning: "border-purple-500",
    Wind: "border-emerald-400",
    Quantum: "border-indigo-500",
    Imaginary: "border-yellow-400",
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

export function BattleSetup() {
    const { initBattle, phase, resetBattle } = useBattleStore();
    const [selectedChars, setSelectedChars] = useState<string[]>([]);
    const [selectedEnemy, setSelectedEnemy] = useState("phantylia");
    const [bossHp, setBossHp] = useState(1000000);
    const [charDialogOpen, setCharDialogOpen] = useState(false);

    // Only show characters that have skill data
    const availableChars = useMemo(() => {
        return characters.filter(c => skills[c.id]);
    }, []);

    // Group characters by path
    const charsByPath = useMemo(() => {
        const grouped: Record<string, Character[]> = {};
        const pathOrder = ["Destruction", "Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance", "Remembrance"];

        availableChars.forEach(char => {
            if (!grouped[char.path]) grouped[char.path] = [];
            grouped[char.path].push(char);
        });

        // Sort by path order
        const sorted: Record<string, Character[]> = {};
        pathOrder.forEach(path => {
            if (grouped[path]) sorted[path] = grouped[path];
        });
        return sorted;
    }, [availableChars]);

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
        setCharDialogOpen(false);
    };

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
            <CardContent className="space-y-4">
                {/* Team Selection Dialog */}
                <div>
                    <h3 className="text-sm text-gray-400 mb-2">
                        Team ({selectedChars.length}/4)
                    </h3>

                    {/* Selected Team Display */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {selectedChars.map((charId, index) => {
                            const char = characters.find(c => c.id === charId);
                            if (!char) return null;
                            return (
                                <div
                                    key={charId}
                                    className={`relative flex items-center gap-2 p-2 rounded bg-gray-800/80 border-2 ${ELEMENT_COLORS[char.element]}`}
                                >
                                    <Badge className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-600 text-xs">
                                        {index + 1}
                                    </Badge>
                                    <Image
                                        src={getCharacterIcon(char.charId)}
                                        alt={char.name}
                                        width={36}
                                        height={36}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                    <span className="text-sm text-white truncate">{char.name}</span>
                                    <button
                                        onClick={() => toggleChar(charId)}
                                        className="ml-auto text-gray-400 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <Dialog open={charDialogOpen} onOpenChange={setCharDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full bg-gray-800/50"
                                disabled={selectedChars.length >= 4}
                            >
                                + Select Characters
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] bg-gray-900 border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Select Team ({selectedChars.length}/4)</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[75vh] pr-4">
                                <div className="space-y-6">
                                    {Object.entries(charsByPath).map(([path, chars]) => (
                                        <div key={path}>
                                            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2 sticky top-0 bg-gray-900 py-2 z-10">
                                                <span className="text-lg">{PATH_ICONS[path] || "❓"}</span>
                                                {path}
                                                <span className="text-xs text-gray-500">({chars.length})</span>
                                            </h4>
                                            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                                {chars.map((char) => {
                                                    const isSelected = selectedChars.includes(char.id);
                                                    const isDisabled = !isSelected && selectedChars.length >= 4;
                                                    return (
                                                        <button
                                                            key={char.id}
                                                            onClick={() => toggleChar(char.id)}
                                                            disabled={isDisabled}
                                                            className={`
                                                                relative p-2 rounded-lg border-2 transition-all text-center
                                                                ${isSelected
                                                                    ? "border-purple-500 bg-purple-500/20 ring-2 ring-purple-500"
                                                                    : `${ELEMENT_COLORS[char.element]} bg-gray-800/50 hover:bg-gray-800`
                                                                }
                                                                ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                                                            `}
                                                        >
                                                            {isSelected && (
                                                                <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-purple-600 text-sm font-bold z-10">
                                                                    {selectedChars.indexOf(char.id) + 1}
                                                                </Badge>
                                                            )}
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Image
                                                                    src={getCharacterIcon(char.charId)}
                                                                    alt={char.name}
                                                                    width={56}
                                                                    height={56}
                                                                    className="rounded-full"
                                                                    unoptimized
                                                                />
                                                                <span className="text-[10px] text-white truncate w-full">
                                                                    {char.name.length > 12 ? char.name.split(' ')[0] : char.name}
                                                                </span>
                                                                <span className="text-[9px] text-gray-500">
                                                                    {char.rarity}★
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Enemy Selection */}
                <div>
                    <h3 className="text-sm text-gray-400 mb-2">Select Enemy</h3>
                    <Select value={selectedEnemy} onValueChange={setSelectedEnemy}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                            {enemies.map((enemy) => (
                                <SelectItem key={enemy.id} value={enemy.id}>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${enemy.type === "boss" ? "border-red-500 text-red-400" :
                                                enemy.type === "elite" ? "border-orange-500 text-orange-400" :
                                                    "border-gray-500 text-gray-400"
                                                }`}
                                        >
                                            {enemy.type}
                                        </Badge>
                                        {enemy.name}
                                    </div>
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
