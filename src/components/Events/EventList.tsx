"use client";

import { motion } from "framer-motion";
import { GameEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountdown, formatTimeLeft } from "@/lib/countdown";

const EVENT_TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    story: { bg: "bg-purple-500/20", text: "text-purple-400", icon: "📖" },
    farming: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "🌾" },
    permanent: { bg: "bg-blue-500/20", text: "text-blue-400", icon: "♾️" },
    recurring: { bg: "bg-orange-500/20", text: "text-orange-400", icon: "🔄" },
    main: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: "⭐" },
    login: { bg: "bg-pink-500/20", text: "text-pink-400", icon: "🎁" },
    battle: { bg: "bg-red-500/20", text: "text-red-400", icon: "⚔️" },
};

const DEFAULT_STYLE = { bg: "bg-gray-500/20", text: "text-gray-400", icon: "📌" };

interface EventItemProps {
    event: GameEvent;
}

function EventItem({ event }: EventItemProps) {
    const endDate = event.endDate || "";
    const timeLeft = useCountdown(endDate);
    const style = EVENT_TYPE_STYLES[event.type] || DEFAULT_STYLE;

    const hasEndDate = !!event.endDate;
    const isEnding = hasEndDate && timeLeft && timeLeft.days < 2;

    return (
        <div className={`
      p-3 rounded-lg border transition-all hover:border-gray-600
      ${isEnding ? "bg-red-900/10 border-red-500/30" : "bg-gray-800/30 border-gray-700"}
    `}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span>{style.icon}</span>
                        <span className="font-medium text-white">{event.name}</span>
                        <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {event.rewards.map((reward) => (
                            <Badge key={reward} variant="outline" className="text-xs border-gray-600">
                                {reward}
                            </Badge>
                        ))}
                    </div>
                </div>

                {timeLeft && (
                    <div className={`
            text-right shrink-0
            ${isEnding ? "text-red-400" : "text-gray-400"}
          `}>
                        <div className="text-xs">
                            {isEnding ? "⚠️ Ending" : "Ends in"}
                        </div>
                        <div className="font-mono font-bold">
                            {formatTimeLeft(timeLeft)}
                        </div>
                    </div>
                )}

                {!timeLeft && event.type === "permanent" && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-0">
                        Permanent
                    </Badge>
                )}
            </div>
        </div>
    );
}

interface EventListProps {
    events: GameEvent[];
}

export function EventList({ events }: EventListProps) {
    // Sort by end date (events ending soon first), permanent last
    const sortedEvents = [...events].sort((a, b) => {
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>📅 Active Events</span>
                    <Badge variant="outline" className="text-xs">
                        {events.length} events
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedEvents.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <EventItem event={event} />
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}
