# Blueprint: Character Showcase & Relic Rater

## Deskripsi Fitur

Character Showcase dengan **Relic Rating yang jujur**. Import UID, tampilkan kartu karakter lengkap, dan berikan rating relic yang tidak "sugar-coating" (misal: Rating D - "Buang relic ini").

---

## Core Features

### 1. UID Import & Character Cards

- Input UID untuk import data
- Tampilkan semua karakter yang di-showcase
- Design kartu mirip in-game tapi lebih informatif

### 2. Brutal Relic Rating

- Rating A-F untuk setiap relic piece
- Breakdown substat quality
- "This relic SUCKS" atau "This is CRACKED" feedback
- Overall set rating

### 3. Build Suggestions

- Optimal substat targets per karakter
- "Upgrade Priority" untuk setiap piece
- Comparison dengan theoretical max

### 4. Share & Export

- Generate shareable card image
- Export build data
- Compare with community builds

---

## Tech Stack

```
Frontend: Next.js 14+, TypeScript, Tailwind, Shadcn
Canvas: html2canvas (untuk generate card images)
API: Mihomo API / Enka Network
State: Zustand
```

---

## Folder Structure

```
showcase/
├── app/
│   ├── page.tsx
│   ├── [uid]/page.tsx          # Profile page
│   └── api/
│       └── import/route.ts
├── components/
│   ├── Profile/
│   │   ├── ProfileHeader.tsx
│   │   └── CharacterGrid.tsx
│   ├── Character/
│   │   ├── CharacterCard.tsx
│   │   ├── StatBlock.tsx
│   │   └── RelicDisplay.tsx
│   ├── Rating/
│   │   ├── RelicRater.tsx
│   │   ├── SubstatBar.tsx
│   │   └── OverallScore.tsx
│   └── Export/
│       └── CardGenerator.tsx
├── lib/
│   ├── rater.ts                # Rating logic
│   ├── mihomo.ts               # API client
│   └── substat-weights.ts      # Substat value weights
└── data/
    ├── optimal-builds.json     # Per-character recommendations
    └── substat-values.json     # Max roll values
```

---

## Relic Rating Logic

```typescript
// Substat max values per roll
const SUBSTAT_MAX = {
  "CRIT Rate": 3.24,
  "CRIT DMG": 6.48,
  "ATK%": 4.32,
  SPD: 2.6,
  // ...
};

// Per-character substat weights
const CHARACTER_WEIGHTS = {
  Acheron: {
    "CRIT Rate": 1.0,
    "CRIT DMG": 1.0,
    "ATK%": 0.8,
    SPD: 0.6,
    "HP%": 0.2,
    "DEF%": 0.1,
  },
  // ...
};

interface RelicRating {
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  score: number; // 0-100
  efficiency: number; // Percentage of max rolls
  message: string; // Brutal feedback
}

const rateRelic = (relic: Relic, character: string): RelicRating => {
  const weights = CHARACTER_WEIGHTS[character];
  let totalValue = 0;
  let maxPossibleValue = 0;

  for (const substat of relic.substats) {
    const weight = weights[substat.type] || 0;
    const maxRoll = SUBSTAT_MAX[substat.type];
    const efficiency = substat.value / (maxRoll * substat.rolls);

    totalValue += efficiency * weight * substat.rolls;
    maxPossibleValue += weight * substat.rolls;
  }

  const score = (totalValue / maxPossibleValue) * 100;

  return {
    grade: getGrade(score),
    score: Math.round(score),
    efficiency: score,
    message: getBrutalMessage(score, relic),
  };
};

const getBrutalMessage = (score: number, relic: Relic): string => {
  if (score >= 90) return "🔥 ABSOLUTELY CRACKED. Never touch this.";
  if (score >= 80) return "✨ Excellent piece. Worth +15.";
  if (score >= 70) return "👍 Solid. Use until you find better.";
  if (score >= 60) return "😐 Copium. Acceptable for now.";
  if (score >= 50) return "💀 Mid. Replace when possible.";
  if (score >= 40) return "🗑️ Fodder. Why is this equipped?";
  return "☠️ DELETE THIS. Immediate action required.";
};
```

---

## Commands

```bash
npx create-next-app@latest showcase --typescript --tailwind --app
cd showcase
npm install zustand html2canvas
npx shadcn-ui@latest init
npx shadcn-ui@latest add card badge progress avatar
npm run dev
```

---

## UI Concept

```
┌────────────────────────────────────────┐
│  UID: 800123456     [Import]           │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  [Avatar]  ACHERON  E2S1         │  │
│  │                                  │  │
│  │  HP: 12,450    DEF: 890          │  │
│  │  ATK: 3,240    SPD: 134          │  │
│  │  CRIT: 78.4% / 245.6%            │  │
│  │                                  │  │
│  │  RELICS:                         │  │
│  │  [Head] ████████░░ B+ (72%)      │  │
│  │  [Hand] ██████████ S  (95%) 🔥   │  │
│  │  [Body] █████░░░░░ C  (55%) 💀   │  │
│  │  [Feet] ████████░░ A- (82%)      │  │
│  │  [Orb]  ███████░░░ B  (70%)      │  │
│  │  [Rope] ██████░░░░ B- (65%)      │  │
│  │                                  │  │
│  │  OVERALL: B+ (73%)               │  │
│  │  "Your Body piece needs work"    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Share Card]  [Export Data]           │
└────────────────────────────────────────┘
```
