"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface LightCone {
    id: string;
    name: string;
    rarity: number;
    rank: number;
    level: number;
    icon: string;
}

export interface Relic {
    id: string;
    name: string;
    setId: string;
    setName: string;
    rarity: number;
    level: number;
    icon: string;
    mainAffix: {
        type: string;
        field: string;
        name: string;
        icon: string;
        value: number;
        display: string;
    };
    subAffixes: Array<{
        type: string;
        field: string;
        name: string;
        icon: string;
        value: number;
        display: string;
        count: number;
        step: number;
    }>;
}

export interface CharacterAttribute {
    field: string;
    name: string;
    icon: string;
    value: number;
    display: string;
}

export interface CharacterSkill {
    id: string;
    name: string;
    level: number;
    maxLevel: number;
    icon: string;
    type: string;
}

export interface UserCharacter {
    id: string;
    name: string;
    rarity: number;
    level: number;
    rank: number; // Eidolon
    element: string;
    path: string;
    icon: string;
    preview: string;
    portrait: string;
    lightCone: LightCone | null;
    relics: Relic[];
    attributes: CharacterAttribute[];
    additions: CharacterAttribute[];
    skills: CharacterSkill[];
}

export interface UserProfile {
    uid: string;
    nickname: string;
    level: number;
    worldLevel: number;
    signature: string;
    avatar: string | null;
    achievements: number;
    characters: UserCharacter[];
}

interface UserContextType {
    uid: string | null;
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isLoggedIn: boolean;
    hasUid: boolean;
    refresh: () => Promise<void>;
    ownedCharacterNames: string[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get UID from session
    const uid = session?.user?.uid || null;
    const isLoggedIn = status === "authenticated";
    const hasUid = !!uid;

    // Load profile when session has UID
    useEffect(() => {
        const loadProfile = async () => {
            if (!uid) {
                setProfile(null);
                return;
            }

            setIsLoading(true);
            try {
                // Try to get cached profile from session storage first
                const cached = sessionStorage.getItem(`hsr_profile_${uid}`);
                if (cached) {
                    setProfile(JSON.parse(cached));
                    setIsLoading(false);
                    return;
                }

                // Fetch from Mihomo API
                const response = await fetch(`/api/mihomo/${uid}`);
                const data = await response.json();

                if (data.success && data.data) {
                    setProfile(data.data);
                    sessionStorage.setItem(`hsr_profile_${uid}`, JSON.stringify(data.data));
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                setError("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        if (uid) {
            loadProfile();
        }
    }, [uid]);

    const refresh = async () => {
        if (!uid) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/mihomo/${uid}`);
            const data = await response.json();

            if (data.success && data.data) {
                setProfile(data.data);
                sessionStorage.setItem(`hsr_profile_${uid}`, JSON.stringify(data.data));

                // Log refresh activity
                await fetch("/api/user/activity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid, type: "profile_refresh", data: { timestamp: new Date() } })
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Get list of owned character names for easy comparison
    const ownedCharacterNames = profile?.characters.map((c) => c.name) || [];

    return (
        <UserContext.Provider
            value={{
                uid,
                profile,
                isLoading: isLoading || status === "loading",
                error,
                isLoggedIn,
                hasUid,
                refresh,
                ownedCharacterNames,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
