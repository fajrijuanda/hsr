"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useCountdown, formatTimeLeft } from "@/lib/countdown";
import { Banner } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
                    {/* Official Banner Image from HoYoLab */}
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-purple-500/30">
                        {banner.bannerImage ? (
                            <Image
                                src={banner.bannerImage}
                                alt={banner.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center">
                                <span className="text-4xl">🎴</span>
                            </div>
                        )}

                        {/* Overlay gradient for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Character names at bottom */}
                        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2">
                            {banner.characters.map((charName) => (
                                <Badge
                                    key={charName}
                                    className="bg-black/60 backdrop-blur-sm text-white border-yellow-500/50"
                                >
                                    ⭐ {charName}
                                </Badge>
                            ))}
                        </div>

                        {/* NEW badge overlay */}
                        {isNew && (
                            <div className="absolute top-2 right-2">
                                <Badge className="bg-emerald-500 text-white border-0 animate-pulse">
                                    NEW
                                </Badge>
                            </div>
                        )}
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
