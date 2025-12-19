"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";

const ELEMENT_COLORS: Record<string, string> = {
    fire: "from-orange-500 to-red-500",
    ice: "from-cyan-400 to-blue-500",
    lightning: "from-purple-500 to-violet-600",
    wind: "from-emerald-400 to-green-500",
    physical: "from-gray-400 to-gray-500",
    quantum: "from-indigo-500 to-purple-600",
    imaginary: "from-yellow-400 to-amber-500",
};

const PATH_ICONS: Record<string, string> = {
    warrior: "⚔️",
    rogue: "🗡️",
    mage: "✨",
    shaman: "🌿",
    warlock: "💀",
    knight: "🛡️",
    priest: "💫",
    destruction: "⚔️",
    hunt: "🗡️",
    erudition: "📚",
    harmony: "🎵",
    nihility: "💀",
    preservation: "🛡️",
    abundance: "💚",
};

export function OwnedCharacters() {
    const { profile, isLoading, refresh, isLoggedIn, hasUid } = useUser();

    if (isLoading) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="py-12">
                    <LoadingSpinner size="lg" text="Loading characters..." />
                </CardContent>
            </Card>
        );
    }

    // Not logged in
    if (!isLoggedIn) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        👤 Your Characters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <p>Login to see your characters</p>
                        <p className="text-sm mt-1">
                            Your showcase characters will appear here
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Logged in but no UID
    if (!hasUid) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        👤 Your Characters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg mb-2">📱 UID belum terhubung</p>
                        <p className="text-sm">
                            Tambahkan UID Star Rail kamu untuk melihat karakter showcase
                        </p>
                        <p className="text-xs mt-2 text-gray-600">
                            UID dapat ditemukan di bagian bawah profil in-game
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Has UID but no characters
    if (!profile || profile.characters.length === 0) {
        return (
            <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        👤 Your Characters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <p>No characters in showcase</p>
                        <p className="text-sm mt-1">
                            Set up your in-game showcase to display characters here
                        </p>
                        <Button variant="outline" size="sm" onClick={refresh} className="mt-4">
                            🔄 Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {profile.avatar && (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50">
                                <Image
                                    src={profile.avatar}
                                    alt={profile.nickname}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                        <div>
                            <CardTitle className="text-lg">{profile.nickname}</CardTitle>
                            <p className="text-xs text-gray-400">
                                Lv.{profile.level} • TL{profile.worldLevel} • {profile.achievements} 🏆
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={refresh} className="text-gray-400">
                        🔄 Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {profile.characters.map((char, index) => {
                        const elementColor = ELEMENT_COLORS[char.element] || ELEMENT_COLORS.physical;
                        const pathIcon = PATH_ICONS[char.path] || "⭐";

                        return (
                            <motion.div
                                key={char.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                <div
                                    className={`
                    relative rounded-lg overflow-hidden border border-gray-700 
                    bg-gradient-to-br ${elementColor} p-0.5
                    hover:border-gray-500 transition-all cursor-pointer
                  `}
                                >
                                    <div className="bg-gray-900 rounded-md overflow-hidden">
                                        {/* Character Preview */}
                                        <div className="relative aspect-[3/4] bg-gray-800">
                                            {char.preview ? (
                                                <Image
                                                    src={char.preview}
                                                    alt={char.name}
                                                    fill
                                                    className="object-cover object-top"
                                                    unoptimized
                                                />
                                            ) : char.icon ? (
                                                <Image
                                                    src={char.icon}
                                                    alt={char.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-4xl">
                                                    {pathIcon}
                                                </div>
                                            )}

                                            {/* Eidolon Badge */}
                                            {char.rank > 0 && (
                                                <div className="absolute top-1 right-1">
                                                    <Badge className="bg-yellow-500/80 text-yellow-100 text-xs px-1">
                                                        E{char.rank}
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Level Badge */}
                                            <div className="absolute bottom-1 left-1">
                                                <Badge className="bg-black/60 text-white text-xs">
                                                    Lv.{char.level}
                                                </Badge>
                                            </div>

                                            {/* Light Cone Indicator */}
                                            {char.lightCone && (
                                                <div className="absolute bottom-1 right-1">
                                                    <Badge className="bg-purple-500/80 text-xs px-1">
                                                        S{char.lightCone.rank}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Character Name */}
                                        <div className="p-2 text-center">
                                            <p className="text-xs font-medium text-white truncate">
                                                {char.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {pathIcon} {char.path}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {profile.signature && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 italic text-center">
                            "{profile.signature}"
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
