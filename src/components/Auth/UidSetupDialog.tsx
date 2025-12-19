"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/feedback";

export function UidSetupDialog() {
    const { data: session, update } = useSession();
    const [open, setOpen] = useState(false);
    const [uid, setUid] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Check if user needs to set UID
    useEffect(() => {
        if (session?.user && !session.user.hasSetUid) {
            // Wait a moment before showing dialog
            const timer = setTimeout(() => setOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate UID format (9 digits)
        if (!/^\d{9}$/.test(uid)) {
            setError("UID must be 9 digits (e.g., 800123456)");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/set-uid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to set UID");
            }

            // Update session
            await update({
                hasSetUid: true,
                uid: uid,
                nickname: data.nickname,
            });

            setSuccess(true);

            // Close dialog after success message
            setTimeout(() => {
                setOpen(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        try {
            await fetch("/api/user/set-uid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skip: true }),
            });

            await update({ hasSetUid: true });
            setOpen(false);
        } catch {
            setOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250]"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[251]
                       w-full max-w-md mx-4"
                    >
                        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-3">🚂</div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Welcome, Trailblazer!
                                </h2>
                                <p className="text-gray-400 mt-2">
                                    Link your HSR account to unlock all features
                                </p>
                            </div>

                            {success ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="text-5xl mb-4">✨</div>
                                    <p className="text-lg text-emerald-400 font-medium">
                                        Account linked successfully!
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">
                                            Your HSR UID
                                        </label>
                                        <Input
                                            type="text"
                                            value={uid}
                                            onChange={(e) => setUid(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                            placeholder="800123456"
                                            className="h-14 text-xl text-center font-mono bg-gray-800 border-gray-600 tracking-wider text-white"
                                            maxLength={9}
                                        />
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Find your UID in-game: Phone → Trailblazer Profile
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handleSkip}
                                        >
                                            Skip for now
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                            disabled={isLoading || uid.length !== 9}
                                        >
                                            {isLoading ? (
                                                <LoadingSpinner size="sm" className="mr-2" />
                                            ) : null}
                                            Link Account
                                        </Button>
                                    </div>
                                </form>
                            )}

                            <p className="text-xs text-gray-500 text-center mt-6">
                                We&apos;ll fetch your profile from the public API to display your characters.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
