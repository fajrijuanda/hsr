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

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Timeline Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
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

        {/* Quick Stats */}
        {team.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700"
                >
                  <div className="text-sm text-gray-400">{member.character.name}</div>
                  <div className="text-2xl font-bold text-white">{totalSpeed} SPD</div>
                  <div className="text-sm text-gray-500">
                    AV: {formatAV(av)} • {actions} act/cycle
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TeamPresets />
            <CharacterPicker />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1">
            <TeamBuilder />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BossSettings />

            {/* Speed Guide */}
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-200">Speed Breakpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">1 action/cycle</span>
                  <span className="text-emerald-400">67+ SPD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">2 actions/cycle</span>
                  <span className="text-cyan-400">134+ SPD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">3 actions/cycle</span>
                  <span className="text-purple-400">200+ SPD</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                <p>Action Value = 10000 / Speed</p>
                <p>Each cycle = 150 AV</p>
                <p>First turn = 50% normal AV</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
          <p>Adjust character speeds using the sliders to see how turn order changes in real-time.</p>
          <p className="mt-1">Lower Action Value = Acts Earlier | Each cycle in MoC is 150 AV</p>
        </footer>
      </main>
    </div>
  );
}
