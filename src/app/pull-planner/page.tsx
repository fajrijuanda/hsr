"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    quickEstimatePulls,
    calculateTotalPulls,
    daysUntilEnough,
    getPityZone,
    simulatePulls,
    formatNumber,
} from "@/lib/pullCalculator";
import { useUser } from "@/context/UserContext";
import bannersData from "@/data/banners.json";

interface Banner {
    id: string;
    phase: string;
    name: string;
    characters: string[];
    startDate: string;
    endDate: string;
    imageUrl?: string;
}

export default function PullPlannerPage() {
    // User context for owned characters
    const { profile, ownedCharacterNames, uid } = useUser();

    // State
    const [currentPity, setCurrentPity] = useState(0);
    const [isGuaranteed, setIsGuaranteed] = useState(false);
    const [stellarJade, setStellarJade] = useState(0);
    const [passes, setPasses] = useState(0);
    const [targetBanner, setTargetBanner] = useState<string>("banner-3-8-1");
    const [simulationResult, setSimulationResult] = useState<{
        successRate: number;
        avgPulls: number;
    } | null>(null);

    const banners = bannersData as Banner[];
    const activeBanner = banners.find((b) => b.id === targetBanner) || banners[0];

    // Check if user already owns banner characters
    const ownedBannerChars = useMemo(() => {
        if (!activeBanner || ownedCharacterNames.length === 0) return [];
        return activeBanner.characters.filter((char) =>
            ownedCharacterNames.some((owned) =>
                owned.toLowerCase().includes(char.toLowerCase()) ||
                char.toLowerCase().includes(owned.toLowerCase())
            )
        );
    }, [activeBanner, ownedCharacterNames]);

    const missingBannerChars = useMemo(() => {
        if (!activeBanner) return [];
        return activeBanner.characters.filter((char) =>
            !ownedCharacterNames.some((owned) =>
                owned.toLowerCase().includes(char.toLowerCase()) ||
                char.toLowerCase().includes(owned.toLowerCase())
            )
        );
    }, [activeBanner, ownedCharacterNames]);

    // Get character details from profile for eidolon info
    const getCharacterEidolon = (charName: string) => {
        if (!profile) return null;
        const char = profile.characters.find((c) =>
            c.name.toLowerCase().includes(charName.toLowerCase()) ||
            charName.toLowerCase().includes(c.name.toLowerCase())
        );
        return char?.rank ?? null;
    };

    // Calculations
    const pullEstimate = useMemo(
        () => quickEstimatePulls(currentPity, isGuaranteed),
        [currentPity, isGuaranteed]
    );

    const resources = useMemo(
        () => calculateTotalPulls(stellarJade, passes),
        [stellarJade, passes]
    );

    const daysNeeded = useMemo(
        () => daysUntilEnough(stellarJade, passes, pullEstimate.avg),
        [stellarJade, passes, pullEstimate.avg]
    );

    const pityZone = getPityZone(currentPity);

    // Calculate days until banner ends
    const daysUntilBannerEnds = useMemo(() => {
        if (!activeBanner) return 0;
        const endDate = new Date(activeBanner.endDate);
        const now = new Date();
        return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }, [activeBanner]);

    // Run simulation
    const runSimulation = () => {
        const result = simulatePulls(currentPity, isGuaranteed, resources.totalPulls);
        setSimulationResult({
            successRate: result.successRate,
            avgPulls: result.avgPulls,
        });
    };

    // Load saved plan
    useEffect(() => {
        if (!uid) return;

        const loadPlan = async () => {
            try {
                const res = await fetch(`/api/user/pull-plan?uid=${uid}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const plan = data.data;
                    setCurrentPity(plan.currentPity);
                    setIsGuaranteed(plan.isGuaranteed);
                    setStellarJade(plan.stellarJade);
                    setPasses(plan.passes);
                    if (plan.targetBanner) setTargetBanner(plan.targetBanner);
                }
            } catch (error) {
                console.error("Failed to load pull plan", error);
            }
        };
        loadPlan();
    }, [uid]);

    // Save plan with debounce
    useEffect(() => {
        if (!uid) return;

        const timer = setTimeout(async () => {
            try {
                await fetch("/api/user/pull-plan", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid,
                        currentPity,
                        isGuaranteed,
                        stellarJade,
                        passes,
                        targetBanner
                    })
                });
            } catch (error) {
                console.error("Failed to save plan", error);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [uid, currentPity, isGuaranteed, stellarJade, passes, targetBanner]);

    // Auto-run simulation when inputs change
    useEffect(() => {
        if (resources.totalPulls > 0) {
            runSimulation();
        }
    }, [currentPity, isGuaranteed, resources.totalPulls]);

    // Get recommendation message with owned character context
    const getRecommendation = () => {
        if (!simulationResult) return null;

        const rate = simulationResult.successRate * 100;
        const allOwned = missingBannerChars.length === 0 && ownedBannerChars.length > 0;
        const someOwned = ownedBannerChars.length > 0 && missingBannerChars.length > 0;

        // If user owns all banner chars
        if (allOwned) {
            return {
                emoji: "⭐",
                message: "You already own all banner characters! Pull for Eidolons if you want.",
                color: "text-purple-400",
            };
        }

        // Check eidolon status for owned chars
        const ownedWithLowEidolon = ownedBannerChars.filter((char) => {
            const eidolon = getCharacterEidolon(char);
            return eidolon !== null && eidolon < 6;
        });

        if (rate >= 90) {
            return {
                emoji: "🎯",
                message: someOwned
                    ? `You're almost guaranteed! Missing: ${missingBannerChars.join(", ")}`
                    : "You're almost guaranteed! Safe to pull.",
                color: "text-emerald-400",
            };
        } else if (rate >= 70) {
            return {
                emoji: "👍",
                message: someOwned
                    ? `Good chance! You still need: ${missingBannerChars.join(", ")}`
                    : "Good chance! Consider pulling if you want.",
                color: "text-green-400",
            };
        } else if (rate >= 50) {
            return {
                emoji: "🤔",
                message: "Coin flip territory. Save more if possible.",
                color: "text-yellow-400",
            };
        } else if (rate >= 30) {
            return {
                emoji: "⚠️",
                message: "Risky! You might want to wait.",
                color: "text-orange-400",
            };
        } else {
            return {
                emoji: "❌",
                message: "Not enough! Keep saving.",
                color: "text-red-400",
            };
        }
    };

    const recommendation = getRecommendation();

    return (
        <div className="min-h-screen">
            {/* Header */}


            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Inputs */}
                    <div className="space-y-6">
                        {/* Pity Tracker */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    📊 Pity Tracker
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-300">Current Pity</Label>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={89}
                                            value={currentPity}
                                            onChange={(e) => setCurrentPity(Math.min(89, Math.max(0, parseInt(e.target.value) || 0)))}
                                            className="w-24 bg-gray-800 border-gray-700"
                                        />
                                        <span className="text-gray-400">/ 90</span>
                                        <Badge
                                            className={`
                        ${pityZone === "safe" ? "bg-emerald-500/20 text-emerald-400" : ""}
                        ${pityZone === "soft" ? "bg-yellow-500/20 text-yellow-400" : ""}
                        ${pityZone === "hot" ? "bg-red-500/20 text-red-400" : ""}
                      `}
                                        >
                                            {pityZone === "safe" && "Safe Zone"}
                                            {pityZone === "soft" && "Soft Pity Soon"}
                                            {pityZone === "hot" && "🔥 Soft Pity!"}
                                        </Badge>
                                    </div>
                                    <Progress
                                        value={(currentPity / 90) * 100}
                                        className="mt-3 h-2"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0</span>
                                        <span className="text-yellow-500">74 (Soft)</span>
                                        <span>90</span>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-gray-300">50/50 Status</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant={!isGuaranteed ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIsGuaranteed(false)}
                                            className={!isGuaranteed ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                        >
                                            50/50
                                        </Button>
                                        <Button
                                            variant={isGuaranteed ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIsGuaranteed(true)}
                                            className={isGuaranteed ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                        >
                                            Guaranteed ✓
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resources */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    💎 Your Resources
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-300">Stellar Jade</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={stellarJade}
                                        onChange={(e) => setStellarJade(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="mt-2 bg-gray-800 border-gray-700"
                                        placeholder="e.g. 12800"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Star Rail Passes</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={passes}
                                        onChange={(e) => setPasses(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="mt-2 bg-gray-800 border-gray-700"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Pulls:</span>
                                        <span className="text-2xl font-bold text-white">
                                            {resources.totalPulls}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ({Math.floor(stellarJade / 160)} from Jade + {passes} Passes)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Column - Banner Selection */}
                    <div className="space-y-6">
                        {/* Target Banner */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    🎯 Target Banner
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Select value={targetBanner} onValueChange={setTargetBanner}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700">
                                        <SelectValue placeholder="Select banner" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        {banners.map((banner) => (
                                            <SelectItem key={banner.id} value={banner.id}>
                                                {banner.phase}: {banner.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {activeBanner && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/30"
                                    >
                                        <div className="flex items-start gap-4">
                                            {activeBanner.imageUrl && (
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                                    <Image
                                                        src={activeBanner.imageUrl}
                                                        alt={activeBanner.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <Badge className="bg-yellow-500/20 text-yellow-400 mb-2">
                                                    {activeBanner.phase}
                                                </Badge>
                                                <h3 className="font-semibold text-white">
                                                    {activeBanner.name}
                                                </h3>
                                                <p className="text-sm text-amber-400 mt-1">
                                                    ⏳ {daysUntilBannerEnds} days remaining
                                                </p>
                                            </div>
                                        </div>

                                        {/* Character Ownership Status */}
                                        {uid && (
                                            <div className="mt-4 pt-4 border-t border-yellow-500/20">
                                                <p className="text-xs text-gray-400 mb-2">Banner Characters:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {activeBanner.characters.map((char) => {
                                                        const isOwned = ownedBannerChars.includes(char);
                                                        const eidolon = getCharacterEidolon(char);
                                                        return (
                                                            <Badge
                                                                key={char}
                                                                className={`
                                                                    ${isOwned
                                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                                                    }
                                                                `}
                                                            >
                                                                {isOwned ? "✓" : "✗"} {char}
                                                                {eidolon !== null && eidolon > 0 && (
                                                                    <span className="ml-1 text-purple-400">E{eidolon}</span>
                                                                )}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                                {missingBannerChars.length > 0 && (
                                                    <p className="text-xs text-red-400 mt-2">
                                                        💡 You&apos;re missing {missingBannerChars.length} character(s) from this banner
                                                    </p>
                                                )}
                                                {missingBannerChars.length === 0 && ownedBannerChars.length > 0 && (
                                                    <p className="text-xs text-emerald-400 mt-2">
                                                        ⭐ You own all characters from this banner!
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Not logged in hint */}
                                        {!uid && (
                                            <div className="mt-4 pt-4 border-t border-yellow-500/20">
                                                <p className="text-xs text-gray-500">
                                                    🔗 Connect your UID to see which characters you own
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pull Estimate */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    🎲 Pull Estimate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/30">
                                        <p className="text-xs text-emerald-400">Best Case</p>
                                        <p className="text-2xl font-bold text-emerald-400">
                                            {pullEstimate.min}
                                        </p>
                                        <p className="text-xs text-gray-500">pulls</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                                        <p className="text-xs text-yellow-400">Average</p>
                                        <p className="text-2xl font-bold text-yellow-400">
                                            {pullEstimate.avg}
                                        </p>
                                        <p className="text-xs text-gray-500">pulls</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                                        <p className="text-xs text-red-400">Worst Case</p>
                                        <p className="text-2xl font-bold text-red-400">
                                            {pullEstimate.max}
                                        </p>
                                        <p className="text-xs text-gray-500">pulls</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Based on {currentPity} pity, {isGuaranteed ? "guaranteed" : "50/50"}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Days Estimate */}
                        {daysNeeded > 0 && (
                            <Card className="bg-gray-900/50 border-gray-700">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Days until enough:</span>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-amber-400">
                                                ~{daysNeeded} days
                                            </span>
                                            <p className="text-xs text-gray-500">at ~188 SJ/day</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Results */}
                    <div className="space-y-6">
                        {/* Success Probability */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    📈 Success Probability
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {simulationResult ? (
                                    <>
                                        <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
                                            <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                                {Math.round(simulationResult.successRate * 100)}%
                                            </p>
                                            <p className="text-gray-400 mt-2">
                                                chance to get featured 5★
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                with {resources.totalPulls} pulls available
                                            </p>
                                        </div>

                                        <Progress
                                            value={simulationResult.successRate * 100}
                                            className="h-3"
                                        />

                                        {recommendation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{recommendation.emoji}</span>
                                                    <p className={`${recommendation.color} font-medium`}>
                                                        {recommendation.message}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Enter your resources to see probability</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    📋 Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">You have:</span>
                                        <span className="text-white font-medium">
                                            {resources.totalPulls} pulls
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">You need (avg):</span>
                                        <span className="text-white font-medium">
                                            {pullEstimate.avg} pulls
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Jade needed:</span>
                                        <span className="text-white font-medium">
                                            {formatNumber(pullEstimate.avg * 160)} 💎
                                        </span>
                                    </div>
                                    <hr className="border-gray-700" />
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Difference:</span>
                                        <span
                                            className={
                                                resources.totalPulls >= pullEstimate.avg
                                                    ? "text-emerald-400 font-bold"
                                                    : "text-red-400 font-bold"
                                            }
                                        >
                                            {resources.totalPulls >= pullEstimate.avg ? "+" : ""}
                                            {resources.totalPulls - pullEstimate.avg} pulls
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banner Timeline */}
                        <Card className="bg-gray-900/50 border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    🗓️ Banner Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {banners.map((banner, index) => {
                                    const now = new Date();
                                    const start = new Date(banner.startDate);
                                    const end = new Date(banner.endDate);
                                    const isActive = now >= start && now <= end;
                                    const isFuture = now < start;

                                    return (
                                        <div
                                            key={banner.id}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer
                        ${isActive ? "bg-yellow-900/20 border-yellow-500/30" : ""}
                        ${isFuture ? "bg-gray-800/30 border-gray-700" : ""}
                        ${!isActive && !isFuture ? "opacity-50 bg-gray-800/10 border-gray-800" : ""}
                        ${targetBanner === banner.id ? "ring-2 ring-yellow-500/50" : ""}
                      `}
                                            onClick={() => setTargetBanner(banner.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Badge
                                                        className={`
                              ${isActive ? "bg-emerald-500/20 text-emerald-400" : ""}
                              ${isFuture ? "bg-blue-500/20 text-blue-400" : ""}
                              ${!isActive && !isFuture ? "bg-gray-500/20 text-gray-400" : ""}
                              text-xs
                            `}
                                                    >
                                                        {isActive ? "NOW" : isFuture ? "UPCOMING" : "ENDED"}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-white mt-1">
                                                        {banner.phase}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {banner.characters.join(" / ")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
