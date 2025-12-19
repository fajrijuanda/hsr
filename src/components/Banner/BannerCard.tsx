"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCountdown, formatTimeLeft } from "@/lib/countdown";
import { Banner } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAR_RAIL_RES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

// Map character names to their charIds for splash art
const CHAR_ID_MAP: Record<string, string> = {
    "The Dahlia": "1321",
    "Firefly": "1310",
    "Fugue": "1317",
    "Lingsha": "1215",
    "Aglaea": "1402",
    "Sunday": "1313",
    "Dan Heng IL": "1213",
    "Acheron": "1308",
    "Aventurine": "1304",
    "Robin": "1309",
    "Sparkle": "1306",
    "Black Swan": "1307",
    "Dr. Ratio": "1305",
    "Ruan Mei": "1303",
    "Fu Xuan": "1208",
    "Jingliu": "1212",
    "Topaz": "1210",
    "Huohuo": "1215",
    "Argenti": "1302",
    "Hanya": "1215",
    "Jing Yuan": "1204",
    "Kafka": "1105",
    "Blade": "1205",
    "Luocha": "1203",
    "Silver Wolf": "1006",
    "Seele": "1102"
};

interface BannerCardProps {
    banner: Banner;
}

// Check if banner started within last 3 days
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
            <Card className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border-purple-500/30 overflow-hidden">
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
                    {/* Character Splash Art - Full Banner Style */}
                    <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30">
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/20" />

                        {/* Character images side by side */}
                        <div className="absolute inset-0 flex justify-center items-end">
                            {banner.characters.map((charName, index) => {
                                const charId = CHAR_ID_MAP[charName];
                                const isFirst = index === 0;
                                return (
                                    <motion.div
                                        key={charName}
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: index * 0.15 }}
                                        className={`relative ${isFirst ? "-mr-8 z-10" : "-ml-8 z-0"}`}
                                        style={{
                                            transform: isFirst ? "translateX(-5%)" : "translateX(5%)"
                                        }}
                                    >
                                        {charId ? (
                                            <Image
                                                src={`${STAR_RAIL_RES}/image/character_preview/${charId}.png`}
                                                alt={charName}
                                                width={250}
                                                height={300}
                                                className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="h-48 md:h-64 w-32 flex items-center justify-center bg-gray-800/50 rounded">
                                                <span className="text-4xl">⭐</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Character name overlays */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                            {banner.characters.map((charName, index) => (
                                <Badge
                                    key={charName}
                                    className={`
                                        bg-black/60 backdrop-blur-sm text-white border-yellow-500/50
                                        ${index === 0 ? "" : "ml-auto"}
                                    `}
                                >
                                    ⭐ {charName}
                                </Badge>
                            ))}
                        </div>
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
