"use client";

import { useMemo } from "react";
import { useCountdown, getDailyResetTime, getWeeklyResetTime, formatTimeLeft } from "@/lib/countdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResetTimers() {
    // Memoize the reset times to prevent recreation on each render
    const dailyReset = useMemo(() => getDailyResetTime(), []);
    const weeklyReset = useMemo(() => getWeeklyResetTime(), []);

    const dailyTimeLeft = useCountdown(dailyReset);
    const weeklyTimeLeft = useCountdown(weeklyReset);

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">⏰ Reset Timers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Daily Reset */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-cyan-400 font-medium">Daily Reset</div>
                            <div className="text-xs text-gray-400">Dailies, Stamina, Shop</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold font-mono text-white">
                                {formatTimeLeft(dailyTimeLeft)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Reset */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-purple-400 font-medium">Weekly Reset</div>
                            <div className="text-xs text-gray-400">Echo of War, Simulated Universe</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold font-mono text-white">
                                {formatTimeLeft(weeklyTimeLeft)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trailblaze Power Info */}
                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="text-sm text-gray-400">
                        <span className="text-yellow-400">💡 Tip:</span> Trailblaze Power regenerates at{" "}
                        <span className="text-white font-medium">1 per 6 minutes</span>{" "}
                        (10 per hour, 240 per day max)
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
