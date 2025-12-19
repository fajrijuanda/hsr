"use client";

import Link from "next/link";

const FOOTER_LINKS = {
    tools: [
        { name: "Speed Tuner", href: "/speed-tuner" },
        { name: "Battle Simulator", href: "/battle-simulator" },
        { name: "Pull Planner", href: "/pull-planner" },
        { name: "Lore Graph", href: "/lore" },
    ],
    resources: [
        { name: "Character Database", href: "/characters" },
        { name: "Light Cones", href: "/light-cones" },
        { name: "Relics Guide", href: "/relics" },
        { name: "Tier List", href: "/tier-list" },
    ],
    community: [
        { name: "Discord", href: "https://discord.gg/starrail", external: true },
        { name: "Reddit", href: "https://reddit.com/r/HonkaiStarRail", external: true },
        { name: "HoYoLab", href: "https://hoyolab.com/", external: true },
    ],
};

export function Footer() {
    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/25">
                                🚀
                            </div>
                            <div>
                                <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Trailblaze Hub
                                </h3>
                                <p className="text-xs text-gray-500">Star Rail Companion</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your all-in-one Honkai: Star Rail toolkit. Track banners, optimize teams, and explore the galaxy.
                        </p>
                    </div>

                    {/* Tools */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Tools</h4>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.tools.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Community</h4>
                        <ul className="space-y-2">
                            {FOOTER_LINKS.community.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.name}
                                        <span className="text-xs">↗</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Trailblaze Hub. Made with 💜 for Trailblazers.
                        </p>

                        {/* Disclaimer */}
                        <p className="text-xs text-gray-600 text-center md:text-right max-w-md">
                            Trailblaze Hub is a fan-made project and is not affiliated with COGNOSPHERE PTE. LTD. or miHoYo Co., Ltd.
                            Honkai: Star Rail and related content are trademarks and copyrights of their respective owners.
                        </p>
                    </div>
                </div>

                {/* Game Version Badge */}
                <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-gray-400">Game Version 3.8 • Site v1.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
