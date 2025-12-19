"use client";

import { LoreGraph } from "@/components/Lore/LoreGraph";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LorePage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="bg-gray-900/80 border-b border-gray-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">← Back</Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Lore Graph
                            </h1>
                            <p className="text-sm text-gray-400">
                                Explore character relationships, factions, and story timeline
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-gray-800 rounded">🖱️ Drag to pan</span>
                        <span className="px-2 py-1 bg-gray-800 rounded">🔍 Scroll to zoom</span>
                        <span className="px-2 py-1 bg-gray-800 rounded">👆 Click for details</span>
                    </div>
                </div>
            </header>

            {/* Graph */}
            <main className="p-4">
                <LoreGraph />
            </main>
        </div>
    );
}
