"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthStep = "login" | "register" | "verify-otp" | "forgot-password";

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [step, setStep] = useState<AuthStep>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setOtp("");
        setError(null);
        setSuccess(null);
    };

    const handleClose = () => {
        resetForm();
        setStep("login");
        onClose();
    };

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
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
                if (result.error.includes("verify")) {
                    setError("Please verify your email first");
                    setStep("verify-otp");
                } else {
                    setError("Invalid email or password");
                }
            } else {
                handleClose();
                window.location.reload();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Register handler
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
            } else {
                setSuccess("Registration successful! Check your email for OTP.");
                setStep("verify-otp");
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // OTP Verification handler
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid OTP");
            } else {
                setSuccess("Email verified! You can now login.");
                setTimeout(() => {
                    setStep("login");
                    setSuccess(null);
                }, 1500);
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSuccess("New OTP sent to your email");
            } else {
                setError("Failed to resend OTP");
            }
        } catch {
            setError("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Forgot password handler
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setSuccess("Password reset link sent to your email");
            } else {
                setError("Failed to send reset link");
            }
        } catch {
            setError("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    // Google login
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl: "/" });
    };

    const renderLoginStep = () => (
        <>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                    <span className="text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Login</h2>
                <p className="text-gray-400 text-sm mt-1">Sign in to access your HSR tools</p>
            </div>

            <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full mb-4 border-gray-600 hover:bg-gray-800 h-12"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-900 text-gray-500">or login with email</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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
                        <button
                            type="button"
                            onClick={() => { setStep("forgot-password"); setError(null); }}
                            className="text-xs text-purple-400 hover:text-purple-300"
                        >
                            Forgot password?
                        </button>
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

                <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : "Login"}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <button
                    onClick={() => { setStep("register"); resetForm(); }}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                >
                    Register
                </button>
            </div>
        </>
    );

    const renderRegisterStep = () => (
        <>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
                    <span className="text-3xl">📝</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Register</h2>
                <p className="text-gray-400 text-sm mt-1">Create your HSR Tools Hub account</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <Label className="text-gray-300">Name</Label>
                    <Input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700"
                        disabled={isLoading}
                        required
                    />
                </div>
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
                    <Label className="text-gray-300">Password</Label>
                    <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700"
                        disabled={isLoading}
                        required
                    />
                </div>
                <div>
                    <Label className="text-gray-300">Confirm Password</Label>
                    <Input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 bg-gray-800 border-gray-700"
                        disabled={isLoading}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || !email || !password || !name}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : "Create Account"}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <button
                    onClick={() => { setStep("login"); resetForm(); }}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                >
                    Login
                </button>
            </div>
        </>
    );

    const renderVerifyOtpStep = () => (
        <>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4">
                    <span className="text-3xl">✉️</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Verify Email</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Enter the 6-digit code sent to<br />
                    <span className="text-purple-400">{email}</span>
                </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                    <Label className="text-gray-300">Verification Code</Label>
                    <Input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="mt-1 bg-gray-800 border-gray-700 text-center text-2xl tracking-[0.5em] font-mono"
                        maxLength={6}
                        disabled={isLoading}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : "Verify"}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-400">
                Didn&apos;t receive code?{" "}
                <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                >
                    Resend
                </button>
            </div>

            <button
                onClick={() => { setStep("login"); resetForm(); }}
                className="mt-2 w-full text-center text-sm text-gray-500 hover:text-gray-400"
            >
                ← Back to Login
            </button>
        </>
    );

    const renderForgotPasswordStep = () => (
        <>
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
                    <span className="text-3xl">🔑</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                <p className="text-gray-400 text-sm mt-1">Enter your email to receive reset link</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
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

                <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
                </Button>
            </form>

            <button
                onClick={() => { setStep("login"); setError(null); setSuccess(null); }}
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-400"
            >
                ← Back to Login
            </button>
        </>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Error/Success Messages */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {step === "login" && renderLoginStep()}
                                {step === "register" && renderRegisterStep()}
                                {step === "verify-otp" && renderVerifyOtpStep()}
                                {step === "forgot-password" && renderForgotPasswordStep()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Features (only show on login) */}
                        {step === "login" && (
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">With an account you get:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Character sync", "Build ratings", "Smart recommendations", "Pull priority"].map((feature) => (
                                        <Badge key={feature} variant="outline" className="text-xs border-gray-700 text-gray-400">
                                            ✓ {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

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
