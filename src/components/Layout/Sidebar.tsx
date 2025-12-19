"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: "🏠" },
    { name: "Speed Tuner", href: "/speed-tuner", icon: "⚡" },
    { name: "Battle Sim", href: "/battle-simulator", icon: "⚔️" },
    { name: "Showcase", href: "/showcase", icon: "🎭" },
    { name: "Pull Planner", href: "/pull-planner", icon: "🎰" },
    { name: "Lore Graph", href: "/lore", icon: "🕸️" },
    { name: "My Characters", href: "/my-characters", icon: "👤" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`
                fixed left-0 top-0 h-screen z-40
                bg-gray-900/95 backdrop-blur-xl border-r border-gray-800
                transition-all duration-300 flex flex-col
                ${isCollapsed ? "w-16" : "w-64"}
            `}
        >
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/25">
                        🚀
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Trailblaze Hub
                            </h1>
                            <p className="text-xs text-gray-500">Star Rail Companion</p>
                        </motion.div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all cursor-pointer
                                    ${isActive
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="text-sm font-medium">{item.name}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-3 border-t border-gray-800">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <span>{isCollapsed ? "→" : "←"}</span>
                    {!isCollapsed && <span className="text-sm">Collapse</span>}
                </button>
            </div>

            {/* Version */}
            {!isCollapsed && (
                <div className="p-3 text-center text-xs text-gray-600">
                    v1.0.0 • Made with 💜
                </div>
            )}
        </motion.aside>
    );
}
