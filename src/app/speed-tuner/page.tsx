"use client";

import { useTeamStore } from "@/stores/teamStore";
import { TimelineBar } from "@/components/Timeline/TimelineBar";
import { CharacterPicker } from "@/components/Controls/CharacterPicker";
import { TeamBuilder } from "@/components/Team/TeamBuilder";
import { TeamPresets } from "@/components/Team/TeamPresets";
import { BossSettings } from "@/components/Controls/BossSettings";
import { getActionsPerCycle, formatAV } from "@/lib/calculator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

const STAR_RAIL_RES_CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

const ELEMENT_COLORS: Record<string, string> = {
  Physical: "bg-gray-400",
  Fire: "bg-red-500",
  Ice: "bg-cyan-400",
  Lightning: "bg-purple-500",
  Wind: "bg-emerald-400",
  Quantum: "bg-indigo-500",
  Imaginary: "bg-yellow-400",
};

export default function SpeedTunerPage() {
  const { timeline, cycles, team } = useTeamStore();

  const turnOrder = timeline
    .filter(e => !e.isEnemy)
    .slice(0, 8)
    .map(e => e.characterName);

  const uniqueOrder = [...new Set(turnOrder)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Speed Tuner
                </h1>
                <p className="text-sm text-gray-400">
                  Action Value Calculator & Timeline Visualizer
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-gray-800/50">
              v1.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Timeline Section - Full Width */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-gray-200">
              Turn Order Timeline
            </h2>
            {team.length > 0 && (
              <div className="text-sm text-gray-400">
                First {Math.min(8, turnOrder.length)} turns:{" "}
                <span className="text-purple-400">
                  {uniqueOrder.join(" → ")}
                </span>
              </div>
            )}
          </div>
          <TimelineBar entries={timeline} cycles={cycles} />
        </section>

        {/* Quick Stats - Compact Cards with Avatars */}
        {team.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {team.map((member) => {
              const totalSpeed = member.character.baseSpeed +
                member.speedBonus +
                member.relicSpeedBonus +
                member.lightConeSpeed +
                Math.floor(member.character.baseSpeed * member.speedPercent / 100);
              const av = 10000 / totalSpeed;
              const actions = getActionsPerCycle(totalSpeed);

              return (
                <div
                  key={member.character.id}
                  className="p-3 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gray-600">
                    <Image
                      src={`${STAR_RAIL_RES_CDN}/icon/character/${member.character.charId}.png`}
                      alt={member.character.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-tl ${ELEMENT_COLORS[member.character.element]}`}
                    />
                  </div>
                  {/* Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-400 truncate">{member.character.name}</div>
                    <div className="text-lg font-bold text-white">{totalSpeed} SPD</div>
                  </div>
                  {/* AV & Actions */}
                  <div className="text-right">
                    <div className="text-xs text-cyan-400">AV: {formatAV(av)}</div>
                    <div className="text-xs text-emerald-400">{actions} act/c</div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Main Grid - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Character Picker */}
          <div className="space-y-6">
            <TeamPresets />
            <CharacterPicker />
          </div>

          {/* Right Column - Team Builder & Settings */}
          <div className="space-y-6">
            <TeamBuilder />

            <BossSettings />

            {/* Speed Guide - Compact */}
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-200">Speed Breakpoints</h3>
              <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                <div className="text-center p-2 rounded bg-gray-800/50">
                  <div className="text-emerald-400 font-bold">67+</div>
                  <div className="text-xs text-gray-500">1 act/cycle</div>
                </div>
                <div className="text-center p-2 rounded bg-gray-800/50">
                  <div className="text-cyan-400 font-bold">134+</div>
                  <div className="text-xs text-gray-500">2 acts/cycle</div>
                </div>
                <div className="text-center p-2 rounded bg-gray-800/50">
                  <div className="text-purple-400 font-bold">200+</div>
                  <div className="text-xs text-gray-500">3 acts/cycle</div>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-700 text-xs text-gray-500 space-y-1">
                <p>Action Value = 10000 / Speed</p>
                <p>Each cycle = 150 AV | First turn = 50% AV</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-6 border-t border-gray-800">
          <p>Adjust character speeds using the sliders to see how turn order changes in real-time.</p>
        </footer>
      </main>
    </div>
  );
}
