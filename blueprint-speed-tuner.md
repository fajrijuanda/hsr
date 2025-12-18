# Blueprint: Speed Tuner Visualizer (Action Value Calculator)

## Deskripsi Fitur

Speed Tuner Visualizer adalah tools interaktif untuk membantu pemain HSR mengoptimalkan **Speed Tuning** tim mereka. Fitur ini memvisualisasikan urutan giliran karakter berdasarkan _Action Value (AV)_ dalam format timeline yang mudah dipahami.

---

## Core Features

### 1. Timeline Visual Bar

- Tampilan timeline horizontal seperti video editor
- Setiap karakter direpresentasikan dengan ikon/card di timeline
- Penanda visual untuk "Cycle 0", "Cycle 1", dst (batas MoC/PF)
- Warna berbeda untuk ally vs enemy turns

### 2. Real-time Speed Adjustment

- Slider interaktif untuk mengatur Speed setiap karakter
- Dropdown untuk memilih Light Cone dan bonus Speed
- Toggle untuk Relic Set bonus (misal: Musketeer +6% Speed)
- Preview langsung perubahan urutan di timeline

### 3. Cycle Calculator

- Input HP Boss untuk kalkulasi cycle
- Tampilkan berapa action yang bisa dilakukan per cycle
- Alert jika urutan tidak optimal (misal: Support jalan setelah DPS)

### 4. Team Presets

- Template tim populer (Acheron, Firefly, DHIL, dll)
- Custom team builder dengan 4 slot karakter
- Save/Load team configuration (localStorage)

---

## Tech Stack

```
Frontend:
├── Next.js 14+ (App Router)
├── TypeScript
├── Tailwind CSS + Shadcn UI
├── Zustand (state management)
├── Framer Motion (animasi timeline)
└── Recharts/D3.js (visualisasi)

Data:
├── JSON files untuk character base stats
├── localStorage untuk user preferences
└── Optional: API untuk sync data

```

---

## Struktur Folder

```
speed-tuner/
├── app/
│   ├── page.tsx                 # Main page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── Timeline/
│   │   ├── TimelineBar.tsx      # Main timeline component
│   │   ├── CharacterNode.tsx    # Individual character on timeline
│   │   ├── CycleMarker.tsx      # Cycle boundary markers
│   │   └── TurnIndicator.tsx    # Current turn indicator
│   ├── Controls/
│   │   ├── SpeedSlider.tsx      # Speed adjustment slider
│   │   ├── CharacterPicker.tsx  # Character selection
│   │   ├── LightConePicker.tsx  # LC selection dropdown
│   │   └── RelicSetToggle.tsx   # Relic set bonuses
│   ├── Team/
│   │   ├── TeamBuilder.tsx      # 4-slot team builder
│   │   ├── TeamPresets.tsx      # Popular team templates
│   │   └── CharacterCard.tsx    # Character info card
│   └── UI/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── ...shadcn components
├── lib/
│   ├── calculator.ts            # AV calculation logic
│   ├── constants.ts             # Base speed values, cycle constants
│   └── utils.ts                 # Helper functions
├── data/
│   ├── characters.json          # All character data
│   ├── lightcones.json          # Light cone data
│   └── relicsets.json           # Relic set bonuses
├── stores/
│   └── teamStore.ts             # Zustand store for team state
├── types/
│   └── index.ts                 # TypeScript interfaces
└── public/
    └── assets/                  # Character icons, etc.
```

---

## Rumus Matematika (Action Value)

### Base Formula

```typescript
// Action Value = 10000 / Speed
// Character with higher Speed has LOWER AV (acts first)

const calculateAV = (speed: number): number => {
  return 10000 / speed;
};

// Initial AV at start of battle
const getInitialAV = (baseSpeed: number, speedBonus: number): number => {
  const totalSpeed = baseSpeed * (1 + speedBonus / 100);
  return 10000 / (totalSpeed * 0.5); // First turn is 50% AV
};

// Subsequent turns
const getNextTurnAV = (currentAV: number, speed: number): number => {
  return currentAV + 10000 / speed;
};
```

### Cycle Boundaries

```typescript
// MoC Cycle boundaries (AV values)
const CYCLE_BOUNDARIES = {
  CYCLE_0: 150, // 0-150 AV
  CYCLE_1: 300, // 150-300 AV
  CYCLE_2: 450, // 300-450 AV
  CYCLE_3: 600, // 450-600 AV
  // ... and so on
};
```

---

## Database Schema (Optional - untuk fitur save online)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50),
  created_at TIMESTAMP
);

-- Saved Teams
CREATE TABLE saved_teams (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  characters JSONB,  -- Array of character configs
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Langkah Implementasi

### Phase 1: Foundation (Week 1)

- [ ] Setup Next.js project dengan TypeScript
- [ ] Install dependencies (Tailwind, Shadcn, Zustand)
- [ ] Buat data JSON untuk 5-10 karakter populer
- [ ] Implementasi logic kalkulasi AV dasar

### Phase 2: Core UI (Week 2)

- [ ] Buat Timeline component dengan posisi statis
- [ ] Implementasi Character Picker
- [ ] Add Speed Slider dengan real-time update
- [ ] Add Cycle markers di timeline

### Phase 3: Interaktivitas (Week 3)

- [ ] Drag & drop untuk mengatur tim
- [ ] Animasi transisi saat speed berubah
- [ ] Team presets
- [ ] Save/Load ke localStorage

### Phase 4: Polish (Week 4)

- [ ] Responsive design
- [ ] Dark/Light mode
- [ ] Export configuration (share link)
- [ ] SEO optimization

---

## Commands untuk Memulai

```bash
# Create Next.js project
npx create-next-app@latest speed-tuner --typescript --tailwind --eslint --app --src-dir

# Navigate to project
cd speed-tuner

# Install additional dependencies
npm install zustand framer-motion recharts

# Install Shadcn UI
npx shadcn-ui@latest init

# Add Shadcn components
npx shadcn-ui@latest add button card slider select dropdown-menu

# Run development server
npm run dev
```

---

## Referensi Visual

- Timeline seperti: Adobe Premiere Pro timeline
- Character cards seperti: Genshin/HSR in-game character preview
- Modern UI inspiration: Linear, Raycast, Vercel dashboard
