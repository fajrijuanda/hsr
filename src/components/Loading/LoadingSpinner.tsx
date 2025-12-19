"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            {/* Orbital ring loader */}
            <div className={cn("relative", sizeClasses[size])}>
                {/* Outer ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Spinning gradient ring */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "conic-gradient(from 0deg, transparent, #a855f7, transparent)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner glow */}
                <motion.div
                    className="absolute inset-2 rounded-full bg-gray-900"
                    animate={{
                        boxShadow: [
                            "0 0 10px rgba(168, 85, 247, 0.3)",
                            "0 0 20px rgba(168, 85, 247, 0.5)",
                            "0 0 10px rgba(168, 85, 247, 0.3)",
                        ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Center star */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center text-purple-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    ✦
                </motion.div>
            </div>

            {text && (
                <motion.p
                    className="text-sm text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}

// Full page loading overlay
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm"
        >
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <motion.p
                    className="mt-4 text-gray-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            </div>
        </motion.div>
    );
}

// Skeleton loader for content
export function ContentSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {[...Array(rows)].map((_, i) => (
                <motion.div
                    key={i}
                    className="h-4 bg-gray-700/50 rounded"
                    style={{ width: `${100 - i * 15}%` }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                    }}
                />
            ))}
        </div>
    );
}
