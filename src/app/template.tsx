"use client";

import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen/SplashScreen";

export default function Template({ children }: { children: React.ReactNode }) {
    // Template remounts on every page navigation, showing the splash screen as a loading transition
    const [showSplash, setShowSplash] = useState(true);

    return (
        <>
            {showSplash && (
                <SplashScreen
                    onComplete={() => setShowSplash(false)}
                    duration={1500} // Slightly faster than initial load for smoother navigation
                />
            )}
            {children}
        </>
    );
}
