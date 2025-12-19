"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "@/components/Auth/LoginModal";
import { NAV_ITEMS } from "@/constants/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function Header() {
    const pathname = usePathname();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { uid: userUID, profile, isLoggedIn } = useUser();

    // Find active nav item
    // Logic: Exact match first, then startsWith for sub-routes (excluding root "/")
    const activeItem = NAV_ITEMS.find((item) =>
        item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
    );

    const title = activeItem ? activeItem.name : "Trailblaze Hub";

    // Icon Logic
    let iconDisplay;
    if (activeItem) {
        iconDisplay = (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/25">
                {activeItem.icon}
            </div>
        );
    } else {
        iconDisplay = (
            <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
            </div>
        );
    }

    return (
        <>
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Title Section */}
                        <div className="flex items-center gap-3">
                            {iconDisplay}
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                    {title}
                                </h1>
                                <p className="text-sm text-gray-400">
                                    {pathname === "/" ? "Your Honkai: Star Rail Companion" : "Trailblaze Hub"}
                                </p>
                            </div>
                        </div>

                        {/* Right Section (Auth & Info) */}
                        <div className="flex items-center gap-3">
                            {/* Hide badges on mobile */}
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hidden md:inline-flex">
                                v3.8
                            </Badge>
                            <Badge variant="outline" className="bg-gray-800/50 hidden md:inline-flex">
                                {new Date().toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                })}
                            </Badge>

                            {isLoggedIn ? (
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                                        {profile?.nickname || (userUID ? `UID: ${userUID.slice(0, 3)}***` : "User")}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => signOut()}
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

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}
