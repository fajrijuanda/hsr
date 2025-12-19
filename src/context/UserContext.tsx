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

    // Load from localStorage on mount and sync with DB
    useEffect(() => {
        const checkSession = async () => {
            const savedUID = localStorage.getItem("hsr_uid");
            if (savedUID) {
                setUid(savedUID);
                setIsLoading(true);
                try {
                    // Try to fetch from our DB first
                    const res = await fetch(`/api/user?uid=${savedUID}`);
                    const data = await res.json();

                    if (data.success && data.data) {
                        // User exists in DB
                        if (data.data.profile?.data) {
                            setProfile(data.data.profile.data as UserProfile);
                        } else {
                            // No profile data in DB, try to load from local storage fallback
                            const savedProfile = localStorage.getItem("hsr_profile");
                            if (savedProfile) {
                                try {
                                    setProfile(JSON.parse(savedProfile));
                                } catch (e) { console.error(e) }
                            }
                        }
                    } else {
                        // User not in DB (cleared?), fallback to localStorage
                        const savedProfile = localStorage.getItem("hsr_profile");
                        if (savedProfile) {
                            try {
                                setProfile(JSON.parse(savedProfile));
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to restore session from DB", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        checkSession();
    }, []);

    const fetchProfileFromMihomo = async (targetUid: string): Promise<UserProfile | null> => {
        const response = await fetch(`/api/mihomo/${targetUid}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to fetch profile");
        }

        return data.data;
    };

    const saveUserToDB = async (uid: string, profileData: UserProfile) => {
        try {
            await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    nickname: profileData.nickname,
                    level: profileData.level,
                    avatar: profileData.avatar,
                    signature: profileData.signature,
                    profileData: dataWrapper(profileData), // Ensure we pass standard JSON
                }),
            });
        } catch (e) {
            console.error("Failed to save user to DB", e);
        }
    };

    // Helper to wrapping profile for DB (if needed structure adjustment)
    const dataWrapper = (p: UserProfile) => {
        return {
            uid: p.uid,
            nickname: p.nickname,
            level: p.level,
            worldLevel: p.worldLevel,
            signature: p.signature,
            avatar: p.avatar,
            achievements: p.achievements,
            characters: p.characters
        };
    }

    const login = async (newUid: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Fetch from Mihomo
            const profileData = await fetchProfileFromMihomo(newUid);

            if (profileData) {
                setUid(newUid);
                setProfile(profileData);

                // 2. Save to DB
                await saveUserToDB(newUid, profileData);

                // 3. Fallback/Session storage
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
            const profileData = await fetchProfileFromMihomo(uid);
            if (profileData) {
                setProfile(profileData);
                await saveUserToDB(uid, profileData);
                localStorage.setItem("hsr_profile", JSON.stringify(profileData));

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
