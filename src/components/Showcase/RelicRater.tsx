"use client";

import { ShowcaseCharacter } from "@/types";
import { rateRelic, getOverallBuildRating } from "@/lib/rater";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RelicRaterProps {
    character: ShowcaseCharacter;
}

const GRADE_COLORS: Record<string, string> = {
    S: "bg-gradient-to-r from-yellow-500 to-orange-500 text-black",
    A: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    B: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    C: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    D: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    F: "bg-gradient-to-r from-red-600 to-red-800 text-white",
};

const SLOT_NAMES: Record<string, string> = {
    head: "Head",
    hands: "Hands",
    body: "Body",
    feet: "Feet",
    orb: "Sphere",
    rope: "Rope",
};

const SLOT_ICONS: Record<string, string> = {
    head: "🎭",
    hands: "🧤",
    body: "👕",
    feet: "👟",
    orb: "🔮",
    rope: "🪢",
};

export function RelicRater({ character }: RelicRaterProps) {
    const relicRatings = character.relics.map(relic => ({
        relic,
        rating: rateRelic(
            {
                id: relic.id,
                slot: relic.slot,
                setName: relic.setName,
                level: relic.level,
                mainStat: relic.mainStat,
                substats: relic.substats,
            },
            character.id
        ),
    }));

    const overallRating = getOverallBuildRating(
        character.relics.map(r => ({
            id: r.id,
            slot: r.slot,
            setName: r.setName,
            level: r.level,
            mainStat: r.mainStat,
            substats: r.substats,
        })),
        character.id
    );

    return (
        <div className="space-y-4">
            {/* Overall Rating */}
            <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Overall Build Rating</CardTitle>
                        <Badge className={`text-xl px-4 py-2 ${GRADE_COLORS[overallRating.grade]}`}>
                            {overallRating.grade}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-2">
                        <Progress value={overallRating.score} className="flex-1" />
                        <span className="text-xl font-bold text-white font-mono w-16 text-right">
                            {overallRating.score}%
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm">{overallRating.message}</p>
                </CardContent>
            </Card>

            {/* Individual Relic Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relicRatings.map(({ relic, rating }) => (
                    <Card key={relic.id} className="bg-gray-900/60 border-gray-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{SLOT_ICONS[relic.slot]}</span>
                                    <div>
                                        <CardTitle className="text-sm">{SLOT_NAMES[relic.slot]}</CardTitle>
                                        <p className="text-xs text-gray-500">{relic.setName}</p>
                                    </div>
                                </div>
                                <Badge className={`${GRADE_COLORS[rating.grade]} font-bold`}>
                                    {rating.grade} ({rating.score}%)
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Main Stat */}
                            <div className="flex items-center justify-between text-sm border-b border-gray-700 pb-2">
                                <span className="text-purple-400">Main: {relic.mainStat.type}</span>
                                <span className="font-mono text-white">{relic.mainStat.value}</span>
                            </div>

                            {/* Substats */}
                            <div className="space-y-2">
                                {rating.substatRatings.map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className={`text-xs flex-1 ${sub.isUseful ? "text-green-400" : "text-gray-500"}`}>
                                            {sub.type}
                                        </span>
                                        <span className="text-xs font-mono text-white w-12 text-right">
                                            {sub.value.toFixed(1)}
                                        </span>
                                        <div className="w-16">
                                            <Progress
                                                value={sub.efficiency}
                                                className={`h-2 ${sub.isUseful ? "" : "opacity-50"}`}
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-400 w-8">
                                            {sub.efficiency.toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Brutal Message */}
                            <p className="text-xs text-center pt-2 border-t border-gray-700">
                                {rating.message}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
