"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { BannerCard } from "@/components/Banner/BannerCard";
import { CodeList } from "@/components/Codes/CodeList";
import { EventList } from "@/components/Events/EventList";
import { ResetTimers } from "@/components/Stats/ResetTimers";
import { FeatureGrid } from "@/components/QuickLinks/FeatureGrid";
import { LiveNews } from "@/components/News/LiveNews";
import { OwnedCharacters } from "@/components/Profile/OwnedCharacters";
import { useUser } from "@/context/UserContext";
import { Banner, RedemptionCode, GameEvent } from "@/types";
import { Badge } from "@/components/ui/badge";

import bannersData from "@/data/banners.json";
import codesData from "@/data/codes.json";
import eventsData from "@/data/events.json";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { uid: userUID } = useUser();

  const banners = bannersData as Banner[];
  const codes = codesData as RedemptionCode[];
  const events = eventsData as GameEvent[];

  // Update time every minute for real-time banner switching
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Get the current active banner (has started and hasn't ended)
  const activeBanner = useMemo(() => {
    const now = currentTime;
    // Find banner that has started and hasn't ended yet
    const active = banners.find((b) => {
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      return startDate <= now && endDate > now;
    });
    // If no active banner, find the next upcoming one
    if (!active) {
      const upcoming = banners.find((b) => new Date(b.startDate) > now);
      return upcoming || banners[0];
    }
    return active;
  }, [banners, currentTime]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome, Trailblazer! 🌟
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your one-stop companion for Honkai: Star Rail. Track banners, redeem codes,
          optimize your builds, and plan your pulls wisely.
        </p>
      </motion.section>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Badge className="bg-yellow-500/20 text-yellow-400 mb-2">
              Version 3.8 — Memories are the Prelude to Dreams
            </Badge>
            <p className="text-sm text-gray-300">
              ✨ New Characters: The Dahlia & Aglaea | 🎮 Chrysos Awoo Championship Event
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-purple-300">Phase 1 Active</Badge>
          </div>
        </div>
      </motion.div>

      {/* Owned Characters (when logged in) */}
      {userUID && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <OwnedCharacters />
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Banners & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BannerCard banner={activeBanner} />
          </motion.div>

          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EventList events={events} />
          </motion.div>

          {/* Live News from HoYoLAB */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LiveNews />
          </motion.div>
        </div>

        {/* Right Column - Tools & Info */}
        <div className="space-y-6">
          {/* Quick Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <FeatureGrid />
          </motion.div>

          {/* Reset Timers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <ResetTimers />
          </motion.div>

          {/* Redemption Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <CodeList codes={codes} />
          </motion.div>

          {/* Quick Links */}
          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-700">
            <h3 className="font-semibold text-white mb-3">🔗 Official Links</h3>
            <div className="space-y-2">
              {[
                { name: "HoYoLAB", url: "https://www.hoyolab.com/home" },
                { name: "Official Site", url: "https://hsr.hoyoverse.com" },
                { name: "Redeem Codes", url: "https://hsr.hoyoverse.com/gift" },
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
    </div>
  );
}
