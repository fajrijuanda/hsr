# Blueprint: Interactive Lore Graph

## Deskripsi Fitur

Visualisasi hubungan antar karakter HSR dalam bentuk **Interactive Knowledge Graph**. Bukan wiki teks biasa, tapi node graph yang bisa di-explore, zoom, dan klik untuk melihat detail relationships.

---

## Core Features

### 1. Node-based Character Graph

- Setiap karakter adalah node
- Edges menunjukkan hubungan (family, faction, enemy, etc)
- Warna berbeda untuk tipe hubungan
- Zoom in/out dan pan

### 2. Faction Clustering

- Auto-group by faction (Stellaron Hunters, Astral Express, etc)
- Toggle view per faction
- Highlight faction connections

### 3. Story Timeline

- Filter graph berdasarkan story chapter
- "What was known at this point" mode
- Spoiler warnings

### 4. Character Details

- Click node untuk detail karakter
- Relationship list dengan context
- Voice lines dan lore excerpts

---

## Tech Stack

```
Frontend: Next.js 14+, TypeScript, Tailwind
Graph Visualization:
  - react-force-graph (3D option)
  - OR vis-network
  - OR cytoscape.js
State: Zustand
```

---

## Folder Structure

```
lore-graph/
├── app/
│   ├── page.tsx
│   ├── character/[id]/page.tsx
│   └── faction/[id]/page.tsx
├── components/
│   ├── Graph/
│   │   ├── ForceGraph.tsx
│   │   ├── GraphControls.tsx
│   │   └── NodeTooltip.tsx
│   ├── Character/
│   │   ├── CharacterModal.tsx
│   │   └── RelationshipList.tsx
│   ├── Filters/
│   │   ├── FactionFilter.tsx
│   │   └── ChapterFilter.tsx
│   └── Timeline/
│       └── StoryTimeline.tsx
├── data/
│   ├── characters.json
│   ├── relationships.json
│   └── factions.json
└── lib/
    └── graph-utils.ts
```

---

## Data Schema

```typescript
interface CharacterNode {
  id: string;
  name: string;
  faction: string;
  element: string;
  path: string;
  bio: string;
  imageUrl: string;
  introducedIn: string; // Story chapter
}

interface Relationship {
  source: string; // Character ID
  target: string; // Character ID
  type: RelationType;
  description: string;
  spoilerLevel: number; // 0=safe, 1=mild, 2=major
}

type RelationType =
  | "family"
  | "master_student"
  | "allies"
  | "enemies"
  | "romantic"
  | "creator_creation"
  | "same_faction"
  | "unknown";
```

---

## Graph Configuration

```typescript
const graphConfig = {
  nodeColor: (node) => FACTION_COLORS[node.faction],
  linkColor: (link) => RELATION_COLORS[link.type],
  linkWidth: (link) => (link.type === "family" ? 3 : 1),
  nodeLabel: (node) => node.name,
  onNodeClick: (node) => openCharacterModal(node),
  cooldownTicks: 100,
  d3AlphaDecay: 0.02,
};

const FACTION_COLORS = {
  "Stellaron Hunters": "#8B0000",
  "Astral Express": "#00CED1",
  "Xianzhou Alliance": "#FFD700",
  IPC: "#808080",
  Penacony: "#9370DB",
};

const RELATION_COLORS = {
  family: "#FF69B4",
  enemies: "#DC143C",
  allies: "#32CD32",
  romantic: "#FF1493",
  same_faction: "#A9A9A9",
};
```

---

## Commands

```bash
npx create-next-app@latest lore-graph --typescript --tailwind --app
cd lore-graph
npm install react-force-graph zustand
npx shadcn-ui@latest init
npx shadcn-ui@latest add card dialog badge
npm run dev
```

---

## Example Relationships

```json
[
  {
    "source": "kafka",
    "target": "silver_wolf",
    "type": "same_faction",
    "description": "Both members of Stellaron Hunters"
  },
  {
    "source": "kafka",
    "target": "trailblazer",
    "type": "creator_creation",
    "description": "Kafka awakened the Trailblazer on Herta Station"
  },
  {
    "source": "jing_yuan",
    "target": "blade",
    "type": "allies",
    "description": "Former comrades in the Cloud Knights"
  },
  {
    "source": "dan_heng",
    "target": "dan_feng",
    "type": "family",
    "description": "Dan Heng is a reincarnation of Dan Feng"
  }
]
```
