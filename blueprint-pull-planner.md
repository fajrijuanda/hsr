# Blueprint: Account ROI & AI Pull Planner

## Deskripsi Fitur

AI Pull Planner adalah sistem rekomendasi yang menganalisis **akun spesifik** pemain dan memberikan saran pull yang personal berdasarkan karakter yang sudah dimiliki.

---

## Core Features

### 1. Account Import & Analysis

- Import data akun via UID (API Mihomo)
- Analisis karakter yang dimiliki
- Assessment team composition

### 2. AI-Powered Recommendations

- Rekomendasi pull berdasarkan roster gaps
- Warning untuk anti-synergy
- Character A vs B comparison

### 3. Resource ROI Calculator

- Estimasi farming days
- Relic domain efficiency
- "Worth it?" score

### 4. Banner Timeline & Planning

- Calendar banner mendatang
- Pity tracker & primogem calculator

---

## Tech Stack

```
Frontend: Next.js 14+, TypeScript, Tailwind, Shadcn, Zustand
Backend: Next.js API Routes, OpenAI/Claude API
Database: PostgreSQL, Redis
External: Mihomo API
```

---

## Folder Structure

```
pull-planner/
├── app/
│   ├── page.tsx
│   ├── import/page.tsx
│   ├── analysis/page.tsx
│   └── api/
│       ├── import/route.ts
│       └── recommend/route.ts
├── components/
│   ├── Import/
│   ├── Analysis/
│   ├── Recommendations/
│   └── Planner/
├── lib/
│   ├── ai/prompts.ts
│   └── calculator/roi.ts
├── data/
│   ├── characters.json
│   └── synergies.json
└── stores/
```

---

## Key Implementation

### Synergy Rules

```typescript
const SYNERGY_RULES = [
  {
    character: "Acheron",
    enhancedBy: ["Jiaoqiu", "Pela", "Silver Wolf"],
  },
  {
    character: "Firefly",
    enhancedBy: ["Ruan Mei", "Harmony MC", "Gallagher"],
  },
];
```

### ROI Calculator

```typescript
const calculateFarmingTime = (character) => {
  const STAMINA_PER_DAY = 240;
  const traceRuns = Math.ceil(traceMaterials / AVG_DROPS);
  const relicRuns = 50; // For usable set
  const totalStamina = (traceRuns + relicRuns) * 40;
  return Math.ceil(totalStamina / STAMINA_PER_DAY);
};
```

---

## Commands

```bash
npx create-next-app@latest pull-planner --typescript --tailwind --app
cd pull-planner
npm install zustand @tanstack/react-query openai
npx shadcn-ui@latest init
npm run dev
```
