"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureLink {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: string;
    status: "available" | "coming-soon" | "new";
    color: string;
}

const FEATURES: FeatureLink[] = [
    {
        id: "speed-tuner",
        name: "Speed Tuner",
        description: "Action Value calculator & timeline visualizer",
        href: "/speed-tuner",
        icon: "⚡",
        status: "available",
        color: "from-purple-600 to-pink-600",
    },
    {
        id: "battle-sim",
        name: "Battle Simulator",
        description: "Turn-by-turn combat simulation",
        href: "/battle-simulator",
        icon: "⚔️",
        status: "available",
        color: "from-red-600 to-orange-600",
    },
    {
        id: "showcase",
        name: "Character Showcase",
        description: "Relic rating with brutal honesty",
        href: "/showcase",
        icon: "🎭",
        status: "coming-soon",
        color: "from-cyan-600 to-blue-600",
    },
    {
        id: "pull-planner",
        name: "Pull Planner",
        description: "AI-powered pull recommendations",
        href: "/pull-planner",
        icon: "🎰",
        status: "coming-soon",
        color: "from-yellow-600 to-amber-600",
    },
    {
        id: "lore-graph",
        name: "Lore Graph",
        description: "Interactive character relationships",
        href: "/lore-graph",
        icon: "🕸️",
        status: "coming-soon",
        color: "from-emerald-600 to-teal-600",
    },
];

const STATUS_STYLES = {
    available: { badge: "bg-emerald-500/20 text-emerald-400", text: "Available" },
    "coming-soon": { badge: "bg-gray-500/20 text-gray-400", text: "Coming Soon" },
    new: { badge: "bg-yellow-500/20 text-yellow-400", text: "New!" },
};

export function FeatureGrid() {
    return (
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">🛠️ Quick Tools</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FEATURES.map((feature, index) => {
                        const statusStyle = STATUS_STYLES[feature.status];
                        const isAvailable = feature.status === "available";

                        const content = (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={isAvailable ? { scale: 1.02 } : {}}
                                className={`
                  p-4 rounded-lg border transition-all
                  ${isAvailable
                                        ? "cursor-pointer bg-gradient-to-br " + feature.color + "/10 border-gray-600 hover:border-gray-500"
                                        : "bg-gray-800/30 border-gray-700 opacity-60"
                                    }
                `}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{feature.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{feature.name}</span>
                                            <Badge className={statusStyle.badge + " text-xs border-0"}>
                                                {statusStyle.text}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );

                        if (isAvailable) {
                            return (
                                <Link key={feature.id} href={feature.href}>
                                    {content}
                                </Link>
                            );
                        }

                        return <div key={feature.id}>{content}</div>;
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
