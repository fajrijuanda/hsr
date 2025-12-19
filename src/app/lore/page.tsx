"use client";

import { LoreGraph } from "@/components/Lore/LoreGraph";



export default function LorePage() {
    return (
        <div className="min-h-screen text-white">
            {/* Header */}


            {/* Graph */}
            <main className="p-4">
                <LoreGraph />
            </main>
        </div>
    );
}
