"use client";

import { useState } from "react";
import { ShowcaseProfile, ShowcaseCharacter } from "@/types";
import { ProfileHeader } from "@/components/Showcase/ProfileHeader";
import { ShowcaseCharacterCard } from "@/components/Showcase/CharacterCard";
import { RelicRater } from "@/components/Showcase/RelicRater";
import { fetchProfile } from "@/lib/mihomo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sample demo data for fallback
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
    ],
};

export default function ShowcasePage() {
    const [uid, setUid] = useState("");
    const [profile, setProfile] = useState<ShowcaseProfile | null>(null);
    const [selectedChar, setSelectedChar] = useState<ShowcaseCharacter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDemoData = () => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setProfile(DEMO_PROFILE);
            setLoading(false);
        }, 500);
    };

    const handleImport = async () => {
        if (!uid) return;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchProfile(uid);

            if (data) {
                setProfile(data);
            } else {
                setError("Could not fetch profile. Make sure the UID is correct and the profile is public.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to connect to API. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}


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
                                    placeholder="Enter UID (e.g., 801334365)"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value)}
                                    className="bg-gray-800 border-gray-700"
                                    onKeyDown={(e) => e.key === "Enter" && handleImport()}
                                />
                                <Button onClick={handleImport} disabled={loading || !uid}>
                                    {loading ? "Loading..." : "Import"}
                                </Button>
                            </div>

                            {error && (
                                <div className="p-3 rounded bg-red-900/30 border border-red-700 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="text-center">
                                <span className="text-gray-500 text-sm">or</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={loadDemoData}
                                disabled={loading}
                                className="w-full"
                            >
                                📊 View Demo Data
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                                Using Mihomo API for live data. Make sure your in-game showcase is public.
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
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-lg font-bold text-white">
                                    Showcased Characters
                                </h3>
                                <Badge variant="outline" className="border-purple-500 text-purple-400">
                                    {profile.characters.length} Characters
                                </Badge>
                            </div>
                            {profile.characters.length === 0 ? (
                                <Card className="bg-gray-900/50 border-gray-700">
                                    <CardContent className="py-8 text-center">
                                        <p className="text-gray-400">No characters in showcase.</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Make sure you have characters displayed in your in-game showcase.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
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
                            )}
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
                                    setError(null);
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
