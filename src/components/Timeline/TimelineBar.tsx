"use client";

import { motion } from "framer-motion";
import { TimelineEntry } from "@/types";
import { getCycleBoundaries, formatAV } from "@/lib/calculator";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineBarProps {
    entries: TimelineEntry[];
    cycles: number;
}

const ELEMENT_COLORS: Record<string, string> = {
    Physical: "bg-gray-400",
    Fire: "bg-red-500",
    Ice: "bg-cyan-400",
    Lightning: "bg-purple-500",
    Wind: "bg-emerald-400",
    Quantum: "bg-indigo-500",
    Imaginary: "bg-yellow-400",
    None: "bg-gray-600",
};

const ELEMENT_TEXT_COLORS: Record<string, string> = {
    Physical: "text-gray-400",
    Fire: "text-red-500",
    Ice: "text-cyan-400",
    Lightning: "text-purple-500",
    Wind: "text-emerald-400",
    Quantum: "text-indigo-500",
    Imaginary: "text-yellow-400",
    None: "text-gray-500",
};

export function TimelineBar({ entries, cycles }: TimelineBarProps) {
    const cycleBoundaries = getCycleBoundaries(cycles);
    const maxAV = cycles * 150;

    if (entries.length === 0) {
        return (
            <div className="w-full h-40 bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-center">
                <p className="text-gray-500">Add characters to see the timeline</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="w-full space-y-4">
                {/* Cycle Headers */}
                <div className="flex gap-1">
                    {cycleBoundaries.map((boundary) => (
                        <div
                            key={boundary.cycle}
                            className="flex-1 text-center"
                        >
                            <Badge variant="outline" className="bg-gray-800/80 border-gray-600">
                                Cycle {boundary.cycle}
                            </Badge>
                        </div>
                    ))}
                </div>

                {/* Timeline Container */}
                <div className="relative w-full h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                    {/* Cycle Dividers */}
                    {cycleBoundaries.slice(1).map((boundary) => (
                        <div
                            key={boundary.cycle}
                            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-purple-500/30 to-transparent"
                            style={{ left: `${(boundary.startAV / maxAV) * 100}%` }}
                        />
                    ))}

                    {/* Timeline Entries */}
                    <div className="absolute inset-0 flex items-center">
                        {entries.map((entry, index) => {
                            const position = (entry.actionValue / maxAV) * 100;

                            return (
                                <Tooltip key={`${entry.characterId}-${index}`}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0, y: -20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: index * 0.03, duration: 0.3 }}
                                            className="absolute transform -translate-x-1/2 cursor-pointer group"
                                            style={{ left: `${Math.min(position, 98)}%` }}
                                        >
                                            <div
                                                className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${entry.isEnemy ? "bg-red-900/80 border-red-500" : "bg-gray-800/90 border-gray-500"}
                          border-2 shadow-lg
                          group-hover:scale-125 group-hover:z-10
                          transition-transform duration-150
                        `}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-full ${ELEMENT_COLORS[entry.element]}`}
                                                />
                                            </div>
                                            {/* Turn number */}
                                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                                                {entry.turnNumber}
                                            </span>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-900 border-gray-700">
                                        <div className="space-y-1">
                                            <p className={`font-bold ${ELEMENT_TEXT_COLORS[entry.element]}`}>
                                                {entry.characterName}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                AV: {formatAV(entry.actionValue)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Turn #{entry.turnNumber}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>

                    {/* AV Scale */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4 text-xs text-gray-600">
                        <span>0</span>
                        {cycleBoundaries.map((b) => (
                            <span key={b.cycle}>{b.endAV}</span>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center text-sm">
                    {Object.entries(ELEMENT_COLORS).filter(([key]) => key !== "None").map(([element, colorClass]) => (
                        <div key={element} className="flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                            <span className="text-gray-400">{element}</span>
                        </div>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}
