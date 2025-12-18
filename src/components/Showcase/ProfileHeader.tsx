"use client";

import { ShowcaseProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
    profile: ShowcaseProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <Card className="bg-gray-900/80 border-gray-700">
            <CardContent className="py-6">
                <div className="flex items-center gap-6">
                    {/* Avatar placeholder */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl">
                        🌟
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-white">{profile.nickname}</h2>
                            <Badge variant="outline" className="border-purple-500 text-purple-400">
                                Lv.{profile.level}
                            </Badge>
                        </div>
                        <div className="text-gray-400 text-sm mb-2">
                            UID: <span className="font-mono text-white">{profile.uid}</span>
                        </div>
                        {profile.signature && (
                            <p className="text-gray-500 text-sm italic">
                                &quot;{profile.signature}&quot;
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                        <div className="text-gray-400 text-sm">Characters</div>
                        <div className="text-2xl font-bold text-white">
                            {profile.characters.length}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
