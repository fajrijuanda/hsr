"use client";

import { useState } from "react";
import Link from "next/link";
import { ShowcaseProfile, ShowcaseCharacter } from "@/types";
import { ProfileHeader } from "@/components/Showcase/ProfileHeader";
import { ShowcaseCharacterCard } from "@/components/Showcase/CharacterCard";
import { RelicRater } from "@/components/Showcase/RelicRater";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample demo data
const DEMO_PROFILE: ShowcaseProfile = {
    uid: "800123456",
    nickname: "HSR Player",
    level: 70,
    signature: "Farming relics is pain",
    characters: [
        {
            id: "acheron",
            name: "Acheron",
            element: "Lightning",
            path: "Nihility",
            level: 80,
            eidolon: 2,
            stats: {
                hp: 12450,
                atk: 3240,
                def: 890,
                spd: 134,
                critRate: 78.4,
                critDmg: 245.6,
            },
            lightCone: {
                id: "lc_acheron",
                name: "Along the Passing Shore",
                level: 80,
                superimposition: 1,
                stats: { hp: 1058, atk: 582, def: 463 },
            },
            relics: [
                {
                    id: "r1",
                    slot: "head",
                    setName: "Pioneer Diver",
                    level: 15,
                    mainStat: { type: "HP", value: 705 },
                    substats: [
                        { type: "CRIT Rate", rolls: 3, value: 8.7 },
                        { type: "CRIT DMG", rolls: 2, value: 11.0 },
                        { type: "ATK%", rolls: 2, value: 7.8 },
                        { type: "SPD", rolls: 1, value: 2.3 },
                    ],
                },
                {
                    id: "r2",
                    slot: "hands",
                    setName: "Pioneer Diver",
                    level: 15,
                    mainStat: { type: "ATK", value: 352 },
                    substats: [
                        { type: "CRIT Rate", rolls: 4, value: 11.6 },
                        { type: "CRIT DMG", rolls: 3, value: 17.5 },
                        { type: "SPD", rolls: 1, value: 2.0 },
                        { type: "HP%", rolls: 1, value: 3.5 },
                    ],
                },
                {
                    id: "r3",
                    slot: "body",
                    setName: "Pioneer Diver",
                    level: 15,
                    mainStat: { type: "CRIT Rate", value: 32.4 },
                    substats: [
                        { type: "CRIT DMG", rolls: 2, value: 10.4 },
                        { type: "ATK%", rolls: 1, value: 3.9 },
                        { type: "DEF%", rolls: 3, value: 12.3 },
                        { type: "HP%", rolls: 2, value: 6.9 },
                    ],
                },
                {
                    id: "r4",
                    slot: "feet",
                    setName: "Pioneer Diver",
                    level: 15,
                    mainStat: { type: "SPD", value: 25 },
                    substats: [
                        { type: "CRIT Rate", rolls: 2, value: 5.8 },
                        { type: "CRIT DMG", rolls: 3, value: 16.2 },
                        { type: "ATK%", rolls: 2, value: 7.3 },
                        { type: "Effect Hit Rate", rolls: 1, value: 3.9 },
                    ],
                },
                {
                    id: "r5",
                    slot: "orb",
                    setName: "Izumo Gensei",
                    level: 15,
                    mainStat: { type: "Lightning DMG", value: 43.2 },
                    substats: [
                        { type: "CRIT Rate", rolls: 2, value: 5.5 },
                        { type: "CRIT DMG", rolls: 2, value: 10.8 },
                        { type: "ATK%", rolls: 2, value: 7.0 },
                        { type: "DEF%", rolls: 2, value: 8.6 },
                    ],
                },
                {
                    id: "r6",
                    slot: "rope",
                    setName: "Izumo Gensei",
                    level: 15,
                    mainStat: { type: "ATK%", value: 43.2 },
                    substats: [
                        { type: "CRIT Rate", rolls: 1, value: 2.9 },
                        { type: "CRIT DMG", rolls: 2, value: 10.4 },
                        { type: "SPD", rolls: 2, value: 4.5 },
                        { type: "HP%", rolls: 3, value: 11.7 },
                    ],
                },
            ],
        },
        {
            id: "sparkle",
            name: "Sparkle",
            element: "Quantum",
            path: "Harmony",
            level: 80,
            eidolon: 0,
            stats: {
                hp: 15800,
                atk: 1890,
                def: 1340,
                spd: 168,
                critRate: 12.3,
                critDmg: 156.8,
            },
            lightCone: {
                id: "lc_sparkle",
                name: "Earthly Escapade",
                level: 80,
                superimposition: 1,
                stats: { hp: 1164, atk: 476, def: 529 },
            },
            relics: [
                {
                    id: "s1",
                    slot: "head",
                    setName: "Sacerdos' Relived Ordeal",
                    level: 15,
                    mainStat: { type: "HP", value: 705 },
                    substats: [
                        { type: "CRIT DMG", rolls: 3, value: 16.5 },
                        { type: "SPD", rolls: 3, value: 7.2 },
                        { type: "DEF%", rolls: 1, value: 4.8 },
                        { type: "Effect RES", rolls: 1, value: 3.9 },
                    ],
                },
                {
                    id: "s2",
                    slot: "hands",
                    setName: "Sacerdos' Relived Ordeal",
                    level: 15,
                    mainStat: { type: "ATK", value: 352 },
                    substats: [
                        { type: "CRIT DMG", rolls: 2, value: 11.0 },
                        { type: "SPD", rolls: 2, value: 4.8 },
                        { type: "HP%", rolls: 2, value: 7.3 },
                        { type: "DEF%", rolls: 2, value: 9.2 },
                    ],
                },
                {
                    id: "s3",
                    slot: "body",
                    setName: "Sacerdos' Relived Ordeal",
                    level: 15,
                    mainStat: { type: "CRIT DMG", value: 64.8 },
                    substats: [
                        { type: "SPD", rolls: 4, value: 9.5 },
                        { type: "HP%", rolls: 2, value: 7.8 },
                        { type: "DEF%", rolls: 1, value: 4.3 },
                        { type: "Effect RES", rolls: 1, value: 3.9 },
                    ],
                },
                {
                    id: "s4",
                    slot: "feet",
                    setName: "Sacerdos' Relived Ordeal",
                    level: 15,
                    mainStat: { type: "SPD", value: 25 },
                    substats: [
                        { type: "CRIT DMG", rolls: 2, value: 10.4 },
                        { type: "HP%", rolls: 3, value: 11.7 },
                        { type: "DEF%", rolls: 2, value: 9.7 },
                        { type: "Effect RES", rolls: 1, value: 3.9 },
                    ],
                },
                {
                    id: "s5",
                    slot: "orb",
                    setName: "Penacony",
                    level: 15,
                    mainStat: { type: "HP%", value: 43.2 },
                    substats: [
                        { type: "CRIT DMG", rolls: 1, value: 5.2 },
                        { type: "SPD", rolls: 2, value: 4.6 },
                        { type: "DEF%", rolls: 3, value: 14.6 },
                        { type: "Effect RES", rolls: 2, value: 7.8 },
                    ],
                },
                {
                    id: "s6",
                    slot: "rope",
                    setName: "Penacony",
                    level: 15,
                    mainStat: { type: "Energy Regen", value: 19.4 },
                    substats: [
                        { type: "CRIT DMG", rolls: 2, value: 10.4 },
                        { type: "SPD", rolls: 3, value: 7.2 },
                        { type: "HP%", rolls: 2, value: 7.3 },
                        { type: "DEF%", rolls: 1, value: 4.8 },
                    ],
                },
            ],
        },
    ],
};

export default function ShowcasePage() {
    const [uid, setUid] = useState("");
    const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
    const [selectedChar, setSelectedChar] = useState<ShowcaseCharacter | null>(null);
    const [loading, setLoading] = useState(false);

    const loadDemoData = () => {
        setLoading(true);
        setTimeout(() => {
            setProfile(DEMO_PROFILE);
            setLoading(false);
        }, 500);
    };

    const handleImport = () => {
        if (!uid) return;
        // For MVP, just load demo data
        loadDemoData();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
            {/* Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Character Showcase
                            </h1>
                            <p className="text-sm text-gray-400">
                                Brutally Honest Relic Rating
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* UID Input */}
                {!profile && (
                    <Card className="max-w-xl mx-auto bg-gray-900/80 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-center">
                                🔍 Import Your Characters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Enter UID (e.g., 800123456)"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    className="bg-gray-800 border-gray-700"
                                />
                                <Button onClick={handleImport} disabled={loading}>
                                    Import
                                </Button>
                            </div>
                            <div className="text-center">
                                <span className="text-gray-500 text-sm">or</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={loadDemoData}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? "Loading..." : "📊 View Demo Data"}
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                                Note: Live API integration coming soon. Demo uses sample data.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Profile Display */}
                {profile && (
                    <div className="space-y-6">
                        <ProfileHeader profile={profile} />

                        {/* Character Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">
                                Showcased Characters ({profile.characters.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profile.characters.map((char) => (
                                    <ShowcaseCharacterCard
                                        key={char.id}
                                        character={char}
                                        isSelected={selectedChar?.id === char.id}
                                        onClick={() => setSelectedChar(
                                            selectedChar?.id === char.id ? null : char
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Selected Character Relic Details */}
                        {selectedChar && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">
                                        📦 {selectedChar.name}&apos;s Relics
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedChar(null)}
                                    >
                                        ✕ Close
                                    </Button>
                                </div>
                                <RelicRater character={selectedChar} />
                            </div>
                        )}

                        {/* Reset Button */}
                        <div className="text-center pt-8">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setProfile(null);
                                    setSelectedChar(null);
                                    setUid("");
                                }}
                            >
                                🔄 Load Different Profile
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center text-sm text-gray-500 pt-8 mt-8 border-t border-gray-800">
                    <p>Relic ratings are based on substat efficiency and character-specific weights.</p>
                    <p className="mt-1">Grades: S (90%+) → A (80%+) → B (70%+) → C (60%+) → D (50%+) → F</p>
                </footer>
            </main>
        </div>
    );
}
