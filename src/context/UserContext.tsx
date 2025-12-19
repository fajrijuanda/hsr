"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    login: (uid: string) => Promise<boolean>;
    logout: () => void;
    refresh: () => Promise<void>;
    ownedCharacterNames: string[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [uid, setUid] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedUID = localStorage.getItem("hsr_uid");
        const savedProfile = localStorage.getItem("hsr_profile");

        if (savedUID) {
            setUid(savedUID);
            if (savedProfile) {
                try {
                    setProfile(JSON.parse(savedProfile));
                } catch {
                    // Invalid JSON, clear it
                    localStorage.removeItem("hsr_profile");
                }
            }
        }
    }, []);

    const fetchProfile = async (targetUid: string): Promise<UserProfile | null> => {
        const response = await fetch(`/api/mihomo/${targetUid}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to fetch profile");
        }

        return data.data;
    };

    const login = async (newUid: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const profileData = await fetchProfile(newUid);

            if (profileData) {
                setUid(newUid);
                setProfile(profileData);
                localStorage.setItem("hsr_uid", newUid);
                localStorage.setItem("hsr_profile", JSON.stringify(profileData));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch profile");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUid(null);
        setProfile(null);
        setError(null);
        localStorage.removeItem("hsr_uid");
        localStorage.removeItem("hsr_profile");
    };

    const refresh = async () => {
        if (!uid) return;

        setIsLoading(true);
        try {
            const profileData = await fetchProfile(uid);
            if (profileData) {
                setProfile(profileData);
                localStorage.setItem("hsr_profile", JSON.stringify(profileData));
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
                isLoading,
                error,
                login,
                logout,
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
