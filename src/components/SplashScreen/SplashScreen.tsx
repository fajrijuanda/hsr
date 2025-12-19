"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface SplashScreenProps {
    onComplete: () => void;
    duration?: number;
}

// Pre-generate random values outside of render
function generateStarData(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
        repeatDelay: Math.random() * 2,
    }));
}

const STAR_DATA = generateStarData(50);

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

    useEffect(() => {
        // Get window dimensions on mount
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 overflow-hidden"
                >
                    {/* Star field background */}
                    <div className="absolute inset-0">
                        {STAR_DATA.map((star) => (
                            <motion.div
                                key={star.id}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    delay: star.delay,
                                    repeat: Infinity,
                                    repeatDelay: star.repeatDelay,
                                }}
                            />
                        ))}
                    </div>

                    {/* Warp speed lines */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => {
                            const angle = (i / 20) * 360;
                            return (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent origin-left"
                                    style={{
                                        width: '60vw',
                                        transform: `rotate(${angle}deg)`,
                                    }}
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{
                                        scaleX: [0, 1, 0],
                                        opacity: [0, 0.6, 0],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: i * 0.05,
                                        repeat: 1,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Central orb glow */}
                    <motion.div
                        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 blur-3xl"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, 1.5, 1],
                            opacity: [0, 0.8, 0.5],
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />

                    {/* Logo / Title */}
                    <motion.div
                        className="relative z-10 text-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {/* Train icon */}
                        <motion.div
                            className="text-7xl mb-4"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            🚂
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                HSR Tools Hub
                            </span>
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            className="text-gray-400 mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            May This Journey Lead Us Starward
                        </motion.p>

                        {/* Loading dots */}
                        <motion.div
                            className="flex justify-center gap-1 mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-purple-500"
                                    animate={{
                                        y: [0, -8, 0],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.15,
                                        repeat: Infinity,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Circular ring */}
                    <motion.div
                        className="absolute w-64 h-64 border-2 border-purple-500/30 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0, 2, 3],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 2,
                            delay: 0.5,
                            repeat: 1,
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
