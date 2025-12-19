"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BannerCard } from "@/components/Banner/BannerCard";
import { CodeList } from "@/components/Codes/CodeList";
import { EventList } from "@/components/Events/EventList";
import { ResetTimers } from "@/components/Stats/ResetTimers";
import { FeatureGrid } from "@/components/QuickLinks/FeatureGrid";
import { LiveNews } from "@/components/News/LiveNews";
import { SplashScreen } from "@/components/SplashScreen/SplashScreen";
import { LoginModal } from "@/components/Auth/LoginModal";
import { OwnedCharacters } from "@/components/Profile/OwnedCharacters";
import { useUser } from "@/context/UserContext";
import { Banner, RedemptionCode, GameEvent } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import bannersData from "@/data/banners.json";
import codesData from "@/data/codes.json";
import eventsData from "@/data/events.json";

export default function DashboardPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { uid: userUID, profile, logout } = useUser();

  const banners = bannersData as Banner[];
  const codes = codesData as RedemptionCode[];
  const events = eventsData as GameEvent[];

  // Get the current active banner (first one that hasn't ended)
  const activeBanner = banners.find(
    (b) => new Date(b.endDate) > new Date()
  ) || banners[0];

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} duration={2500} />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

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
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                  v3.8
                </Badge>
                <Badge variant="outline" className="bg-gray-800/50 hidden sm:inline-flex">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                </Badge>

                {/* Login Button */}
                {userUID ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      {profile?.nickname || `UID: ${userUID.slice(0, 3)}***${userUID.slice(-3)}`}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-gray-400 hover:text-white"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="sm"
                  >
                    <span className="mr-1">🔐</span>
                    Login
                  </Button>
                )}
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
    </>
  );
}
