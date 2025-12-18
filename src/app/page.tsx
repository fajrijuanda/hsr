"use client";

import { motion } from "framer-motion";
import { BannerCard } from "@/components/Banner/BannerCard";
import { CodeList } from "@/components/Codes/CodeList";
import { EventList } from "@/components/Events/EventList";
import { ResetTimers } from "@/components/Stats/ResetTimers";
import { FeatureGrid } from "@/components/QuickLinks/FeatureGrid";
import { Banner, RedemptionCode, GameEvent } from "@/types";
import { Badge } from "@/components/ui/badge";

import bannersData from "@/data/banners.json";
import codesData from "@/data/codes.json";
import eventsData from "@/data/events.json";

export default function DashboardPage() {
  const banners = bannersData as Banner[];
  const codes = codesData as RedemptionCode[];
  const events = eventsData as GameEvent[];

  // Get the current active banner (first one that hasn't ended)
  const activeBanner = banners.find(
    (b) => new Date(b.endDate) > new Date()
  ) || banners[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                HSR Tools Hub
              </h1>
              <p className="text-sm text-gray-400">
                Your Honkai: Star Rail Companion
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                v3.8
              </Badge>
              <Badge variant="outline" className="bg-gray-800/50">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome, Trailblazer! 🚀
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your all-in-one toolkit for Honkai: Star Rail. Track banners, redeem codes,
            optimize teams, and never miss an event.
          </p>
        </motion.section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Banner & Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Banner */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                🎰 Current Banner
              </h3>
              <BannerCard banner={activeBanner} />
            </div>

            {/* Quick Tools */}
            <FeatureGrid />

            {/* Events */}
            <EventList events={events} />
          </div>

          {/* Right Column - Codes & Timers */}
          <div className="space-y-6">
            {/* Codes */}
            <CodeList codes={codes} />

            {/* Reset Timers */}
            <ResetTimers />

            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-semibold text-gray-200 mb-2">📢 Version 3.8</h3>
              <p className="text-xs text-purple-400 mb-2">&quot;Memories are the Prelude to Dreams&quot;</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• New Characters: The Dahlia, Cyrene, Hyacine</li>
                <li>• New Story: Okhema Continuation</li>
                <li>• Main Event: Chrysos Awoo Championship</li>
                <li>• Gift of Odyssey: 10 Free Passes</li>
                <li>• Extended 8-week update cycle</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-semibold text-gray-200 mb-3">🔗 Useful Links</h3>
              <div className="space-y-2">
                {[
                  { name: "Official Site", url: "https://hsr.hoyoverse.com" },
                  { name: "Redeem Codes", url: "https://hsr.hoyoverse.com/gift" },
                  { name: "HoYoLAB", url: "https://www.hoyolab.com" },
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                  >
                    {link.name} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pt-8 border-t border-gray-800">
          <p>
            HSR Tools is a fan-made project. Not affiliated with HoYoverse.
          </p>
          <p className="mt-1">
            Data sourced from community. Some information may not be accurate.
          </p>
        </footer>
      </main>
    </div>
  );
}
