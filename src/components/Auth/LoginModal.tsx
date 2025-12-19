"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (uid: string) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const [uid, setUid] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!uid || uid.length < 9) {
            setError("Please enter a valid UID (9 digits)");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        try {
            // In real implementation, this would fetch from Mihomo/Enka API
            await new Promise((resolve) => setTimeout(resolve, 1500));
            onLogin(uid);
            onClose();
        } catch (err) {
            setError("Failed to fetch profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                                <span className="text-3xl">🔗</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Connect Account</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Enter your UID to sync your profile
                            </p>
                        </div>

                        {/* Info Badge */}
                        <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-start gap-2">
                                <span className="text-blue-400">ℹ️</span>
                                <div>
                                    <p className="text-sm text-blue-300">
                                        Your UID can be found in-game at the bottom of your profile.
                                    </p>
                                    <p className="text-xs text-blue-400/70 mt-1">
                                        We use Enka.Network API to fetch your public profile data.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Star Rail UID</Label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 800123456"
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                    className="mt-2 bg-gray-800 border-gray-700 text-center text-lg tracking-widest"
                                    maxLength={9}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    {uid.length}/9 digits
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || uid.length < 9}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <span className="mr-2">🚀</span>
                                        Connect Profile
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Or divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-gray-900 text-gray-500">or continue without login</span>
                            </div>
                        </div>

                        {/* Guest mode */}
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full border-gray-700 text-gray-400 hover:text-white"
                        >
                            Continue as Guest
                        </Button>

                        {/* Features list */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">With a connected account you get:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    "Character sync",
                                    "Pull history",
                                    "Build ratings",
                                    "Smart recommendations",
                                ].map((feature) => (
                                    <Badge
                                        key={feature}
                                        variant="outline"
                                        className="text-xs border-gray-700 text-gray-400"
                                    >
                                        ✓ {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
