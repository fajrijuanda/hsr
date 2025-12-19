"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import Link from "next/link";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                onClose();
                setEmail("");
                setPassword("");
                // Page will refresh due to session change
                window.location.reload();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/" });
    };

    const handleClose = () => {
        setEmail("");
        setPassword("");
        setError(null);
        onClose();
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
                        onClick={handleClose}
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
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Login</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Sign in to access your HSR tools
                            </p>
                        </div>

                        {/* Google Login */}
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full mb-4 border-gray-600 hover:bg-gray-800 h-12"
                        >
                            {isLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-gray-900 text-gray-500">or login with email</span>
                            </div>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Email</Label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 bg-gray-800 border-gray-700"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300">Password</Label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs text-purple-400 hover:text-purple-300"
                                        onClick={handleClose}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 bg-gray-800 border-gray-700"
                                    disabled={isLoading}
                                    required
                                />
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
                                disabled={isLoading || !email || !password}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <>
                                        <span className="mr-2">🚀</span>
                                        Login
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-4 text-center text-sm text-gray-400">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/register"
                                className="text-purple-400 hover:text-purple-300 font-medium"
                                onClick={handleClose}
                            >
                                Register
                            </Link>
                        </div>

                        {/* Features list */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">With a linked account you get:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    "Character sync",
                                    "Build ratings",
                                    "Smart recommendations",
                                    "Pull priority",
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
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            disabled={isLoading}
                        >
                            ✕
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
