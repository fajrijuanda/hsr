"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingScreen, LoadingSpinner, AlertDialog } from "@/components/ui/feedback";
import charactersData from "@/data/characters.json";

const STAR_RAIL_RES = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

// Element name mapping for CDN (Lightning is called Thunder in the CDN)
const ELEMENT_CDN_MAP: Record<string, string> = {
    "Lightning": "Thunder",
};

const getElementCdnName = (element: string) => ELEMENT_CDN_MAP[element] || element;

interface Character {
    id: string;
    charId: string;
    name: string;
    element: string;
    path: string;
    rarity: number;
}

interface OwnedCharacter {
    id: string;
    characterId: string;
    eidolon: number;
}

export default function MyCharactersPage() {
    const { data: session, status } = useSession();
    const [characters] = useState<Character[]>(charactersData as Character[]);
    const [ownedChars, setOwnedChars] = useState<Map<string, OwnedCharacter>>(new Map());
    const [search, setSearch] = useState("");
    const [filterElement, setFilterElement] = useState<string | null>(null);
    const [filterPath, setFilterPath] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);

    const elements = ["Physical", "Fire", "Ice", "Lightning", "Wind", "Quantum", "Imaginary"];
    const paths = ["Destruction", "The Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance"];

    // Fetch owned characters
    const fetchOwned = useCallback(async () => {
        if (!session?.user?.uid) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/user/characters?uid=${session.user.uid}`);
            if (res.ok) {
                const data = await res.json();
                const map = new Map<string, OwnedCharacter>();
                data.forEach((c: OwnedCharacter) => map.set(c.characterId, c));
                setOwnedChars(map);
            }
        } catch {
            // Silent fail
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.uid]);

    useEffect(() => {
        fetchOwned();
    }, [fetchOwned]);

    const toggleOwnership = async (charId: string) => {
        if (!session?.user?.uid) {
            setShowAlert(true);
            return;
        }

        setIsSaving(true);
        const isOwned = ownedChars.has(charId);

        try {
            if (isOwned) {
                // Remove
                await fetch(`/api/user/characters?uid=${session.user.uid}&characterId=${charId}`, {
                    method: "DELETE",
                });
                setOwnedChars((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(charId);
                    return newMap;
                });
            } else {
                // Add
                await fetch("/api/user/characters", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: session.user.uid, characterId: charId }),
                });
                setOwnedChars((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(charId, { id: "", characterId: charId, eidolon: 0 });
                    return newMap;
                });
            }
        } catch {
            // Handle error
        } finally {
            setIsSaving(false);
        }
    };

    const setEidolon = async (charId: string, eidolon: number) => {
        if (!session?.user?.uid) return;

        try {
            await fetch("/api/user/characters/eidolon", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: session.user.uid, characterId: charId, eidolon }),
            });
            setOwnedChars((prev) => {
                const newMap = new Map(prev);
                const existing = newMap.get(charId);
                if (existing) {
                    newMap.set(charId, { ...existing, eidolon });
                }
                return newMap;
            });
        } catch {
            // Handle error
        }
        setSelectedChar(null);
    };

    // Filter and Sort characters
    const filteredChars = characters.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesElement = !filterElement || c.element === filterElement;
        const matchesPath = !filterPath || c.path === filterPath;
        return matchesSearch && matchesElement && matchesPath;
    }).sort((a, b) => {
        if (sortOrder === "name") {
            return a.name.localeCompare(b.name);
        }
        // Assuming higher charId (numeric) means newer
        const idA = parseInt(a.charId);
        const idB = parseInt(b.charId);
        if (sortOrder === "newest") {
            return idB - idA;
        } else {
            return idA - idB;
        }
    });

    if (status === "loading" || isLoading) {
        return <LoadingScreen show={true} message="Loading characters..." />;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="bg-gray-900/80 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">← Back</Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                My Characters
                            </h1>
                            <p className="text-sm text-gray-400">
                                Manage your owned characters
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-emerald-400">
                            {ownedChars.size} Owned
                        </Badge>
                        {isSaving && <LoadingSpinner size="sm" />}
                    </div>
                </div>
            </header>

            {/* Filters */}
            {/* Filters */}
            <div className="sticky top-[73px] z-40 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-6 py-3">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Input
                            placeholder="Search characters..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64 bg-gray-800 border-gray-600"
                        />

                        {/* Sort Dropdown */}
                        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                            {[
                                { value: "newest", label: "Newest" },
                                { value: "oldest", label: "Oldest" },
                                { value: "name", label: "A-Z" }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSortOrder(opt.value as any)}
                                    className={`
                                        px-3 py-1.5 rounded text-xs font-medium transition-all
                                        ${sortOrder === opt.value
                                            ? "bg-gray-700 text-white shadow-sm"
                                            : "text-gray-400 hover:text-white"
                                        }
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {/* Elements */}
                        <div className="flex gap-1">
                            <Button
                                variant={filterElement === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterElement(null)}
                                className="h-8 px-2 text-xs"
                            >
                                All
                            </Button>
                            {elements.map((elem) => (
                                <button
                                    key={elem}
                                    onClick={() => setFilterElement(filterElement === elem ? null : elem)}
                                    className={`
                                        w-8 h-8 rounded flex items-center justify-center transition-all border
                                        ${filterElement === elem
                                            ? "bg-gray-700 border-purple-500 scale-105"
                                            : "bg-gray-800 border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100"
                                        }
                                    `}
                                    title={elem}
                                >
                                    <Image
                                        src={`${STAR_RAIL_RES}/icon/element/${getElementCdnName(elem)}.png`}
                                        alt={elem}
                                        width={20}
                                        height={20}
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="hidden sm:block w-px bg-gray-700 mx-1" />

                        {/* Paths */}
                        <div className="flex gap-1">
                            {paths.map((path) => (
                                <button
                                    key={path}
                                    onClick={() => setFilterPath(filterPath === path ? null : path)}
                                    className={`
                                        w-8 h-8 rounded flex items-center justify-center transition-all border
                                        ${filterPath === path
                                            ? "bg-gray-700 border-purple-500 scale-105"
                                            : "bg-gray-800 border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100"
                                        }
                                    `}
                                    title={path}
                                >
                                    <Image
                                        src={`${STAR_RAIL_RES}/icon/path/${path}.png`}
                                        alt={path}
                                        width={20}
                                        height={20}
                                        className="invert brightness-200"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Character Grid */}
            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                    {filteredChars.map((char, index) => {
                        const owned = ownedChars.get(char.id);
                        const isOwned = !!owned;
                        const eidolon = owned?.eidolon ?? 0;

                        return (
                            <motion.div
                                key={char.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.01 }}
                            >
                                <button
                                    onClick={() => toggleOwnership(char.id)}
                                    className={`
                                        relative group rounded-lg overflow-hidden transition-all duration-200 w-full
                                        ${isOwned
                                            ? "ring-2 ring-emerald-500/70 hover:ring-emerald-400"
                                            : "opacity-40 grayscale-[0.7] hover:opacity-100 hover:grayscale-0"
                                        }
                                        hover:scale-105 hover:z-10
                                    `}
                                    title={`${char.name}${isOwned ? ` (E${eidolon})` : ""} - Click to toggle`}
                                >
                                    {/* Character Avatar */}
                                    <div className={`
                                        aspect-square bg-gradient-to-br from-gray-800 to-gray-900
                                        ${char.rarity === 5 ? "border-b-2 border-yellow-500" : "border-b-2 border-purple-500"}
                                    `}>
                                        <Image
                                            src={`${STAR_RAIL_RES}/icon/character/${char.charId}.png`}
                                            alt={char.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />

                                        {/* Element Badge (top-right) */}
                                        <Image
                                            src={`${STAR_RAIL_RES}/icon/element/${getElementCdnName(char.element)}.png`}
                                            alt={char.element}
                                            width={18}
                                            height={18}
                                            className="absolute top-0.5 right-0.5 drop-shadow-lg"
                                            unoptimized
                                        />

                                        {/* Ownership Check (top-left) */}
                                        {isOwned && (
                                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-emerald-500 rounded-sm flex items-center justify-center text-[10px] font-bold shadow-md">
                                                ✓
                                            </div>
                                        )}

                                        {/* Eidolon Badge (bottom-left) */}
                                        {isOwned && (
                                            <div
                                                className={`absolute bottom-0.5 left-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold shadow-md
                                                    ${eidolon >= 6 ? "bg-yellow-500 text-black" :
                                                        eidolon >= 3 ? "bg-purple-500 text-white" :
                                                            "bg-gray-700 text-white"}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedChar(char);
                                                }}
                                            >
                                                E{eidolon}
                                            </div>
                                        )}

                                        {/* Not Owned Overlay */}
                                        {!isOwned && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-lg">+</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="bg-gray-900/90 px-1 py-1">
                                        <p className="text-[10px] font-medium truncate text-center text-gray-200">
                                            {char.name}
                                        </p>
                                    </div>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* Eidolon Dialog */}
            {selectedChar && (
                <EidolonDialog
                    char={selectedChar}
                    currentEidolon={ownedChars.get(selectedChar.id)?.eidolon || 0}
                    onClose={() => setSelectedChar(null)}
                    onSet={(e) => setEidolon(selectedChar.id, e)}
                />
            )}

            {/* Not logged in alert */}
            <AlertDialog
                open={showAlert}
                onClose={() => setShowAlert(false)}
                title="Login Required"
                description="Please log in and link your HSR UID to manage your characters."
                type="warning"
                confirmText="Go to Login"
                onConfirm={() => window.location.href = "/auth/login"}
                showCancel
            />
        </div>
    );
}

function EidolonDialog({
    char,
    currentEidolon,
    onClose,
    onSet,
}: {
    char: Character;
    currentEidolon: number;
    onClose: () => void;
    onSet: (eidolon: number) => void;
}) {
    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-[200]" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201]
                   bg-gray-900 border border-gray-700 rounded-xl p-6 w-80"
            >
                <h3 className="text-lg font-bold mb-4 text-center">
                    Set Eidolon for {char.name}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((e) => (
                        <Button
                            key={e}
                            variant={currentEidolon === e ? "default" : "outline"}
                            className={currentEidolon === e ? "bg-purple-600" : ""}
                            onClick={() => onSet(e)}
                        >
                            E{e}
                        </Button>
                    ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
                    Cancel
                </Button>
            </motion.div>
        </>
    );
}
