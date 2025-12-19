"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCountdown, formatTimeLeft } from "@/lib/countdown";
import { Banner } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAR_RAIL_RES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

// Map character names to their charIds for fallback
const CHAR_ID_MAP: Record<string, string> = {
    "The Dahlia": "1321",
    "Firefly": "1310",
    "Fugue": "1225",
    "Lingsha": "1215",
    "Aglaea": "1402",
    "Sunday": "1313",
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

interface BannerImageData {
    id: string;
    title: string;
    image: string | null;
}

export function BannerCard({ banner }: BannerCardProps) {
    const timeLeft = useCountdown(banner.endDate);
    const formattedTime = formatTimeLeft(timeLeft);
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    const isEnding = timeLeft.days < 3;
    const isNew = checkIsNew(banner.startDate);

    // Fetch banner image from HoYoLab API
    useEffect(() => {
        const fetchBannerImage = async () => {
            try {
                const response = await fetch("/api/hoyolab/banners");
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    // Find matching banner by phase (e.g., "Phase I", "Phase II")
                    const phaseMatch = banner.phase.match(/Phase\s*(\d+|I+)/i);
                    let matchingBanner = null;

                    if (phaseMatch) {
                        matchingBanner = data.data.find((b: BannerImageData) =>
                            b.title.toLowerCase().includes(`phase ${phaseMatch[1].toLowerCase()}`) ||
                            b.title.toLowerCase().includes(`phase i`) && phaseMatch[1] === "1"
                        );
                    }

                    // If no phase match, just use the first one (most recent)
                    if (!matchingBanner && data.data[0]) {
                        matchingBanner = data.data[0];
                    }

                    if (matchingBanner?.image) {
                        setBannerImage(matchingBanner.image);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch banner image:", error);
            } finally {
                setImageLoading(false);
            }
        };

        fetchBannerImage();
    }, [banner.phase]);

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
                    {/* Banner Image from HoYoLab */}
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/60 via-pink-900/40 to-purple-900/60 border border-purple-500/30">
                        {bannerImage ? (
                            <>
                                <Image
                                    src={bannerImage}
                                    alt={banner.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                                {/* Overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            </>
                        ) : imageLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-pulse text-gray-500">Loading...</div>
                            </div>
                        ) : (
                            // Fallback: Show character images side by side
                            <div className="absolute inset-0 flex justify-center items-end">
                                {banner.characters.map((charName, index) => {
                                    const charId = CHAR_ID_MAP[charName];
                                    return (
                                        <motion.div
                                            key={charName}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15 }}
                                            className={index === 0 ? "z-10 -mr-8" : "z-0"}
                                        >
                                            {charId && (
                                                <Image
                                                    src={`${STAR_RAIL_RES}/image/character_preview/${charId}.png`}
                                                    alt={charName}
                                                    width={200}
                                                    height={250}
                                                    className="h-44 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                                    unoptimized
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Character name badges */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                            {banner.characters.map((charName) => (
                                <Badge
                                    key={charName}
                                    className="bg-black/70 backdrop-blur-sm text-white border-yellow-500/50 shadow-lg"
                                >
                                    ⭐ {charName}
                                </Badge>
                            ))}
                        </div>

                        {/* NOW LIVE badge */}
                        {isNew && (
                            <div className="absolute top-2 right-2">
                                <Badge className="bg-emerald-500 text-white border-0 animate-pulse shadow-lg">
                                    NOW LIVE
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
