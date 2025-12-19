"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    BackgroundVariant,
    Panel,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Import lore data
import charactersLore from "@/data/lore/characters-lore.json";
import factionsData from "@/data/lore/factions.json";
import locationsData from "@/data/lore/locations.json";
import timelineData from "@/data/lore/timeline.json";

const STAR_RAIL_RES_CDN = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master";

type ViewType = "characters" | "factions" | "locations" | "timeline";

interface CharacterLore {
    id: string;
    name: string;
    title: string;
    faction: string;
    element: string;
    path: string;
    bio: string;
    relationships: { target: string; type: string; label: string }[];
}

interface Faction {
    id: string;
    name: string;
    type: string;
    description: string;
    leader: string;
    members: string[];
    color: string;
    icon: string;
}

// Helper to format faction names (remove underscores, title case)
function formatFactionName(faction: string): string {
    return faction
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// Custom Character Node
function CharacterNode({ data }: { data: CharacterLore & { charId?: string } }) {
    return (
        <div className="bg-gray-800/90 border border-gray-600 rounded-lg p-2 min-w-[120px] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                    {data.charId && (
                        <Image
                            src={`${STAR_RAIL_RES_CDN}/icon/character/${data.charId}.png`}
                            alt={data.name}
                            width={40}
                            height={40}
                            className="object-cover"
                            unoptimized
                        />
                    )}
                </div>
                <div>
                    <div className="text-sm font-medium text-white">{data.name}</div>
                    <div className="text-xs text-gray-400">{formatFactionName(data.faction)}</div>
                </div>
            </div>
        </div>
    );
}

// Custom Faction Node
function FactionNode({ data }: { data: Faction }) {
    return (
        <div
            className="border-2 rounded-xl p-4 min-w-[180px] transition-transform hover:scale-105"
            style={{ backgroundColor: `${data.color}20`, borderColor: data.color }}
        >
            <div className="text-center">
                <div className="text-2xl mb-1">{data.icon}</div>
                <div className="text-sm font-bold text-white">{data.name}</div>
                <div className="text-xs text-gray-300 mt-1">{data.members.length} members</div>
            </div>
        </div>
    );
}

// Custom Location Node
function LocationNode({ data }: { data: { name: string; type: string } }) {
    const typeIcons: Record<string, string> = {
        space_station: "🛸",
        planet: "🌍",
        flagship: "⛵",
        dreamscape: "🌙",
    };

    return (
        <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 border border-blue-500/50 rounded-xl p-4 min-w-[140px]">
            <div className="text-center">
                <div className="text-2xl mb-1">{typeIcons[data.type] || "📍"}</div>
                <div className="text-sm font-bold text-white">{data.name}</div>
                <div className="text-xs text-blue-300 capitalize">{data.type.replace("_", " ")}</div>
            </div>
        </div>
    );
}

// Timeline Event Node
function TimelineNode({ data }: { data: { title: string; chapter: string } }) {
    return (
        <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 border border-amber-500/50 rounded-lg p-3 min-w-[200px] max-w-[250px]">
            <Badge variant="outline" className="mb-1 text-xs">{data.chapter}</Badge>
            <div className="text-sm font-medium text-white">{data.title}</div>
        </div>
    );
}

const nodeTypes = {
    character: CharacterNode,
    faction: FactionNode,
    location: LocationNode,
    timeline: TimelineNode,
};

// Edge colors based on relationship type
const edgeColors: Record<string, string> = {
    ally: "#22c55e",
    enemy: "#ef4444",
    family: "#f59e0b",
    friend: "#3b82f6",
    related: "#8b5cf6",
    serves: "#ec4899",
    complex: "#6b7280",
};

export function LoreGraph() {
    const [view, setView] = useState<ViewType>("characters");
    const [search, setSearch] = useState("");
    const [selectedNode, setSelectedNode] = useState<CharacterLore | Faction | null>(null);

    const characters = charactersLore as Record<string, CharacterLore>;
    const factions = factionsData as Record<string, Faction>;

    // Generate nodes and edges based on view
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        if (view === "characters") {
            // Position characters in an organized grid (board layout)
            const charArray = Object.values(characters);
            const cols = 4; // 4 columns
            const cellWidth = 200;
            const cellHeight = 120;
            const startX = 100;
            const startY = 100;

            charArray.forEach((char, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                nodes.push({
                    id: char.id,
                    type: "character",
                    position: {
                        x: startX + col * cellWidth,
                        y: startY + row * cellHeight,
                    },
                    data: { ...char, charId: getCharId(char.id) },
                });

                // Create edges for relationships with arrow markers
                char.relationships.forEach((rel) => {
                    if (characters[rel.target]) {
                        edges.push({
                            id: `${char.id}-${rel.target}`,
                            source: char.id,
                            target: rel.target,
                            label: rel.label,
                            type: "smoothstep",
                            style: { stroke: edgeColors[rel.type] || "#888", strokeWidth: 2 },
                            animated: rel.type === "enemy",
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: edgeColors[rel.type] || "#888",
                            },
                            labelStyle: { fill: "#fff", fontSize: 10 },
                            labelBgStyle: { fill: "#1f2937", fillOpacity: 0.8 },
                        });
                    }
                });
            });
        } else if (view === "factions") {
            // Faction view: group characters by faction
            const factionArray = Object.values(factions);
            const spacing = 300;

            factionArray.forEach((faction, i) => {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const baseX = col * spacing + 100;
                const baseY = row * 400 + 100;

                // Faction node
                nodes.push({
                    id: faction.id,
                    type: "faction",
                    position: { x: baseX, y: baseY },
                    data: faction as unknown as Record<string, unknown>,
                });

                // Member nodes under faction
                faction.members.forEach((memberId, j) => {
                    const char = characters[memberId];
                    if (char) {
                        nodes.push({
                            id: `${faction.id}-${memberId}`,
                            type: "character",
                            position: { x: baseX + (j % 3) * 130, y: baseY + 100 + Math.floor(j / 3) * 80 },
                            data: { ...char, charId: getCharId(memberId) },
                        });

                        edges.push({
                            id: `edge-${faction.id}-${memberId}`,
                            source: faction.id,
                            target: `${faction.id}-${memberId}`,
                            type: "smoothstep",
                            style: { stroke: faction.color, strokeWidth: 2 },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: faction.color,
                            },
                        });
                    }
                });
            });
        } else if (view === "locations") {
            const locs = Object.values(locationsData);
            locs.forEach((loc, i) => {
                nodes.push({
                    id: loc.id,
                    type: "location",
                    position: { x: 200 + i * 250, y: 200 },
                    data: loc,
                });

                // Connections
                loc.connectedTo?.forEach((targetId: string) => {
                    if (locationsData[targetId as keyof typeof locationsData]) {
                        edges.push({
                            id: `loc-${loc.id}-${targetId}`,
                            source: loc.id,
                            target: targetId,
                            type: "smoothstep",
                            style: { stroke: "#3b82f6", strokeWidth: 3 },
                            animated: true,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: "#3b82f6",
                            },
                        });
                    }
                });
            });
        } else if (view === "timeline") {
            timelineData.forEach((event, i) => {
                nodes.push({
                    id: event.id,
                    type: "timeline",
                    position: { x: 100, y: 50 + i * 120 },
                    data: event,
                });

                if (i > 0) {
                    edges.push({
                        id: `timeline-${i}`,
                        source: timelineData[i - 1].id,
                        target: event.id,
                        style: { stroke: "#f59e0b", strokeWidth: 2 },
                        animated: true,
                    });
                }
            });
        }

        return { initialNodes: nodes, initialEdges: edges };
    }, [view, characters, factions]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes/edges when view changes
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        const char = characters[node.id];
        const faction = factions[node.id];
        setSelectedNode(char || faction || null);
    }, [characters, factions]);

    // Filter nodes by search
    const filteredNodes = useMemo(() => {
        if (!search) return nodes;
        return nodes.filter((n) => {
            const name = (n.data as { name?: string })?.name;
            return name?.toLowerCase().includes(search.toLowerCase());
        });
    }, [nodes, search]);

    // Default edge options for visibility
    const defaultEdgeOptions = {
        type: "smoothstep",
        style: { strokeWidth: 2 },
        animated: false,
    };

    return (
        <div className="h-[calc(100vh-120px)] w-full bg-gray-950 rounded-xl overflow-hidden relative">
            <ReactFlow
                nodes={filteredNodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                className="bg-gray-950"
            >
                <Controls className="bg-gray-800 border-gray-700" />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === "faction") return factions[n.id]?.color || "#888";
                        return "#6366f1";
                    }}
                    className="bg-gray-800 border-gray-700"
                />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />

                {/* Control Panel */}
                <Panel position="top-left" className="space-y-2">
                    <div className="flex gap-2">
                        {(["characters", "factions", "locations", "timeline"] as ViewType[]).map((v) => (
                            <Button
                                key={v}
                                variant={view === v ? "default" : "outline"}
                                size="sm"
                                onClick={() => setView(v)}
                                className={view === v ? "bg-purple-600" : ""}
                            >
                                {v === "characters" && "👥"}
                                {v === "factions" && "🏛️"}
                                {v === "locations" && "🌍"}
                                {v === "timeline" && "📅"}
                                <span className="ml-1 capitalize">{v}</span>
                            </Button>
                        ))}
                    </div>
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 bg-gray-800/90 border-gray-600"
                    />
                </Panel>

                {/* Legend */}
                <Panel position="bottom-left">
                    <div className="bg-gray-800/90 p-3 rounded-lg border border-gray-700 text-xs">
                        <div className="font-medium text-white mb-2">Relationship Types</div>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(edgeColors).map(([type, color]) => (
                                <div key={type} className="flex items-center gap-1">
                                    <div className="w-3 h-1 rounded" style={{ backgroundColor: color }} />
                                    <span className="text-gray-300 capitalize">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {/* Detail Panel */}
            {selectedNode && (
                <div className="absolute top-4 right-4 w-80 z-50">
                    <Card className="bg-gray-900/95 border-gray-700">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedNode(null)}>✕</Button>
                            </div>
                            {"title" in selectedNode && (
                                <div className="text-sm text-gray-400">{selectedNode.title}</div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {"bio" in selectedNode && (
                                <p className="text-sm text-gray-300">{selectedNode.bio}</p>
                            )}
                            {"description" in selectedNode && (
                                <p className="text-sm text-gray-300">{selectedNode.description}</p>
                            )}
                            {"element" in selectedNode && (
                                <div className="flex gap-2">
                                    <Badge>{selectedNode.element}</Badge>
                                    <Badge variant="outline">{selectedNode.path}</Badge>
                                </div>
                            )}
                            {"members" in selectedNode && (
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Members:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedNode.members.map((m) => (
                                            <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// Helper to get character charId for avatar
function getCharId(id: string): string {
    const charIdMap: Record<string, string> = {
        acheron: "1308",
        kafka: "1005",
        blade: "1205",
        silver_wolf: "1006",
        march_7th: "1001",
        dan_heng: "1002",
        himeko: "1003",
        welt: "1004",
        trailblazer: "8001",
        sunday: "1313",
        robin: "1309",
        aventurine: "1304",
        topaz: "1112",
        jingliu: "1212",
        jing_yuan: "1204",
        fu_xuan: "1208",
        sparkle: "1306",
        black_swan: "1307",
    };
    return charIdMap[id] || "";
}
