"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCountdown, formatTimeLeft } from "@/lib/countdown";
import { Banner } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import charactersData from "@/data/characters.json";

const STAR_RAIL_RES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

interface CharacterData {
    id: string;
    charId: string;
    name: string;
    rarity: number;
}

interface BannerCardProps {
    banner: Banner;
}

// Map character names to their charIds
const getCharId = (name: string): string | null => {
    const chars = charactersData as CharacterData[];
    // Handle special name mappings
    const nameMap: Record<string, string> = {
        "The Dahlia": "the_herta",
        "Dan Heng IL": "dan_heng_il",
    };

    const searchName = nameMap[name] || name.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "");
    const found = chars.find(c =>
        c.id === searchName ||
        c.name.toLowerCase() === name.toLowerCase()
    );
    return found?.charId || null;
};

// Check if banner is new (started within last 3 days)
const checkIsNew = (startDate: string): boolean => {
    const bannerStart = new Date(startDate).getTime();
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    return bannerStart > threeDaysAgo;
};

export function BannerCard({ banner }: BannerCardProps) {
    const timeLeft = useCountdown(banner.endDate);
    const formattedTime = formatTimeLeft(timeLeft);

    const isEnding = timeLeft.days < 3;
    const isNew = checkIsNew(banner.startDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            🎴 {banner.name}
                            {isNew && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                                    NEW
                                </Badge>
                            )}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                            {banner.phase}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Character Images - Featured Section */}
                    <div className="flex justify-center gap-4 py-4">
                        {banner.characters.map((charName) => {
                            const charId = getCharId(charName);
                            return (
                                <motion.div
                                    key={charName}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative group"
                                >
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-yellow-500/50 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                        {charId ? (
                                            <Image
                                                src={`${STAR_RAIL_RES}/icon/character/${charId}.png`}
                                                alt={charName}
                                                width={112}
                                                height={112}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                                ⭐
                                            </div>
                                        )}
                                    </div>
                                    {/* Character Name Label */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-600 rounded text-xs font-medium whitespace-nowrap shadow-md">
                                        {charName}
                                    </div>
                                    {/* 5-star indicator */}
                                    <div className="absolute -top-1 -right-1 text-yellow-400 text-sm">
                                        ⭐
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Light Cones */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {banner.lightCones.map((lc) => (
                            <Badge
                                key={lc}
                                variant="outline"
                                className="text-xs text-gray-400 border-gray-600"
                            >
                                📖 {lc}
                            </Badge>
                        ))}
                    </div>

                    {/* Countdown */}
                    <div className={`
                        p-4 rounded-lg text-center
                        ${isEnding
                            ? "bg-red-900/30 border border-red-500/50"
                            : "bg-gray-800/50 border border-gray-700"
                        }
                    `}>
                        <div className="text-sm text-gray-400 mb-1">
                            {isEnding ? "⚠️ Ending Soon!" : "Ends in"}
                        </div>
                        <div className={`text-2xl font-bold font-mono ${isEnding ? "text-red-400" : "text-white"}`}>
                            {formattedTime}
                        </div>
                    </div>

                    {/* Time boxes */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                            { label: "Days", value: timeLeft.days },
                            { label: "Hours", value: timeLeft.hours },
                            { label: "Mins", value: timeLeft.minutes },
                            { label: "Secs", value: timeLeft.seconds },
                        ].map((item) => (
                            <div key={item.label} className="p-2 rounded bg-gray-800/50">
                                <div className="text-xl font-bold text-purple-400">
                                    {String(item.value).padStart(2, "0")}
                                </div>
                                <div className="text-xs text-gray-500">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
