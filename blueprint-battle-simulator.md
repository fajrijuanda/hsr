# Blueprint: Sandbox Battle Simulator

## Deskripsi Fitur

Battle Simulator adalah engine berbasis web yang memungkinkan pemain mensimulasikan pertarungan HSR secara akurat **tanpa harus masuk ke game**. Ini bukan game grafis 3D, melainkan simulasi logika turn-based yang menghitung damage, buff, debuff, dan energy secara presisi.

---

## Core Features

### 1. Custom Scenario Builder

- Pilih musuh dari database (Boss MoC, Boss PF, Elite enemies)
- Set HP musuh secara custom (misal: 2 Juta HP)
- Pilih jumlah wave dan enemies per wave
- Toggle weakness type musuh

### 2. Turn-by-Turn Combat Engine

- Interface seperti tactical RPG (button-based, bukan real-time)
- Setiap turn: pilih Basic ATK, Skill, atau Ultimate
- Engine menghitung:
  - Damage output (dengan semua multiplier)
  - Energy regeneration
  - Buff/Debuff duration
  - HP reduction pada musuh

### 3. Damage Comparison ("Ghost Mode")

- Jalankan 2 simulasi paralel
- Build A vs Build B comparison
- Grafik perbandingan DPS per cycle
- Summary: "Build A deals 15% more damage over 3 cycles"

### 4. Battle Log & Analytics

- Detailed log setiap action
- Breakdown damage (base, crit, vulnerability, etc)
- Chart visualisasi damage over time
- Export battle log sebagai text/JSON

---

## Tech Stack

```
Frontend:
├── Next.js 14+ (App Router)
├── TypeScript
├── Tailwind CSS + Shadcn UI
├── Zustand (battle state management)
├── Recharts (damage charts)
└── Framer Motion (UI animations)

Backend (Optional - untuk complex calculations):
├── Python FastAPI / Go
├── Damage formula engine
└── Battle simulation API

Data:
├── Character stats JSON
├── Enemy database JSON
├── Skill multipliers JSON
└── Buff/Debuff effects JSON
```

---

## Struktur Folder

```
battle-simulator/
├── app/
│   ├── page.tsx                 # Main simulator page
│   ├── layout.tsx               # Root layout
│   ├── scenario/
│   │   └── page.tsx             # Scenario builder page
│   └── results/
│       └── page.tsx             # Battle results/comparison
├── components/
│   ├── Scenario/
│   │   ├── ScenarioBuilder.tsx  # Main scenario setup
│   │   ├── EnemyPicker.tsx      # Enemy selection
│   │   ├── TeamSetup.tsx        # Team configuration
│   │   └── WeaknessToggle.tsx   # Element weakness settings
│   ├── Battle/
│   │   ├── BattleArena.tsx      # Main battle view
│   │   ├── ActionBar.tsx        # Skill/Basic/Ult buttons
│   │   ├── CharacterStatus.tsx  # HP, Energy, Buffs display
│   │   ├── EnemyStatus.tsx      # Enemy HP, Debuffs
│   │   ├── TurnOrder.tsx        # Action order display
│   │   └── BattleLog.tsx        # Action log panel
│   ├── Comparison/
│   │   ├── GhostMode.tsx        # Side-by-side comparison
│   │   ├── DamageChart.tsx      # DPS comparison chart
│   │   └── SummaryCard.tsx      # Result summary
│   └── UI/
│       └── ...shared components
├── engine/
│   ├── BattleEngine.ts          # Core battle logic
│   ├── DamageCalculator.ts      # Damage formula implementation
│   ├── BuffManager.ts           # Buff/Debuff handling
│   ├── EnergySystem.ts          # Energy regeneration
│   ├── TurnSystem.ts            # Turn order management
│   └── types.ts                 # Battle system types
├── data/
│   ├── characters/              # Individual character data
│   │   ├── acheron.json
│   │   ├── sparkle.json
│   │   └── ...
│   ├── enemies/
│   │   ├── moc-bosses.json
│   │   └── pf-bosses.json
│   ├── skills/
│   │   └── skill-multipliers.json
│   └── buffs/
│       └── buff-effects.json
├── stores/
│   ├── battleStore.ts           # Battle state
│   ├── scenarioStore.ts         # Scenario configuration
│   └── comparisonStore.ts       # Ghost mode state
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
└── public/
    └── assets/
```

---

## Damage Formula Implementation

### Base Damage Formula

```typescript
interface DamageParams {
  baseDamage: number;
  skillMultiplier: number;
  attackStat: number;
  critRate: number;
  critDamage: number;
  damageBonus: number; // Element DMG%, All DMG%
  defenseReduction: number; // From debuffs
  vulnerabilityBonus: number; // Weakness broken, etc
  resistance: number; // Enemy resistance
  resReduction: number; // RES pen
}

const calculateDamage = (params: DamageParams): number => {
  const {
    baseDamage,
    skillMultiplier,
    attackStat,
    critRate,
    critDamage,
    damageBonus,
    defenseReduction,
    vulnerabilityBonus,
    resistance,
    resReduction,
  } = params;

  // Step 1: Base Damage
  const rawDamage = baseDamage + skillMultiplier * attackStat;

  // Step 2: Crit Calculation
  const isCrit = Math.random() < critRate;
  const critMultiplier = isCrit ? 1 + critDamage : 1;

  // Step 3: Damage Bonus
  const bonusMultiplier = 1 + damageBonus;

  // Step 4: Defense Multiplier (simplified)
  const defMultiplier = 1 - defenseReduction;

  // Step 5: Vulnerability
  const vulnMultiplier = 1 + vulnerabilityBonus;

  // Step 6: Resistance
  const effectiveRes = Math.max(0, resistance - resReduction);
  const resMultiplier = 1 - effectiveRes;

  // Final Damage
  return (
    rawDamage *
    critMultiplier *
    bonusMultiplier *
    defMultiplier *
    vulnMultiplier *
    resMultiplier
  );
};
```

### Energy System

```typescript
interface EnergyConfig {
  maxEnergy: number; // Usually 120-140
  basicAttackEnergy: number; // Usually 20
  skillEnergy: number; // Usually 30
  ultCost: number; // Ultimate energy cost
}

class EnergyManager {
  private currentEnergy: number = 0;
  private config: EnergyConfig;

  constructor(config: EnergyConfig) {
    this.config = config;
  }

  onBasicAttack(): void {
    this.addEnergy(this.config.basicAttackEnergy);
  }

  onSkill(): void {
    this.addEnergy(this.config.skillEnergy);
  }

  canUseUltimate(): boolean {
    return this.currentEnergy >= this.config.ultCost;
  }

  useUltimate(): void {
    if (this.canUseUltimate()) {
      this.currentEnergy -= this.config.ultCost;
    }
  }

  private addEnergy(amount: number): void {
    this.currentEnergy = Math.min(
      this.currentEnergy + amount,
      this.config.maxEnergy
    );
  }
}
```

---

## Buff/Debuff System

```typescript
interface Effect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  stat: string; // ATK%, DMG%, SPD, etc
  value: number;
  duration: number; // Turns remaining
  stackable: boolean;
  maxStacks: number;
  source: string; // Character who applied
}

class EffectManager {
  private effects: Effect[] = [];

  addEffect(effect: Effect): void {
    if (effect.stackable) {
      const existing = this.effects.find((e) => e.id === effect.id);
      if (existing && existing.stacks < effect.maxStacks) {
        existing.stacks++;
        existing.duration = effect.duration;
        return;
      }
    }
    this.effects.push({ ...effect, stacks: 1 });
  }

  onTurnEnd(): void {
    this.effects = this.effects
      .map((e) => ({ ...e, duration: e.duration - 1 }))
      .filter((e) => e.duration > 0);
  }

  getStatModifier(stat: string): number {
    return this.effects
      .filter((e) => e.stat === stat)
      .reduce((sum, e) => sum + e.value * (e.stacks || 1), 0);
  }
}
```

---

## Database Schema

```sql
-- Battle Scenarios
CREATE TABLE scenarios (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  user_id UUID,
  team_config JSONB,
  enemy_config JSONB,
  created_at TIMESTAMP
);

-- Battle Results (for history/comparison)
CREATE TABLE battle_results (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id),
  total_damage BIGINT,
  cycles_taken INTEGER,
  action_log JSONB,
  created_at TIMESTAMP
);

-- Shared Scenarios (community feature)
CREATE TABLE shared_scenarios (
  id UUID PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id),
  title VARCHAR(200),
  description TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP
);
```

---

## Langkah Implementasi

### Phase 1: Engine Core (Week 1-2)

- [ ] Setup Next.js project
- [ ] Implement DamageCalculator class
- [ ] Implement EnergyManager class
- [ ] Implement EffectManager (buff/debuff)
- [ ] Create TurnSystem for action order
- [ ] Unit tests untuk formula accuracy

### Phase 2: Battle UI (Week 3-4)

- [ ] Scenario Builder UI
- [ ] Battle Arena layout
- [ ] Action buttons (Basic/Skill/Ult)
- [ ] Character & Enemy status displays
- [ ] Turn order indicator
- [ ] Battle log panel

### Phase 3: Data Integration (Week 5)

- [ ] Create character data JSON files
- [ ] Create enemy database
- [ ] Map all skill multipliers
- [ ] Map all relic set effects
- [ ] Map all Light Cone effects

### Phase 4: Ghost Mode & Analytics (Week 6)

- [ ] Side-by-side comparison view
- [ ] DPS charts with Recharts
- [ ] Summary statistics
- [ ] Export functionality

### Phase 5: Polish (Week 7-8)

- [ ] Responsive design
- [ ] Save/Load scenarios
- [ ] Share scenarios
- [ ] Performance optimization
- [ ] SEO

---

## Commands untuk Memulai

```bash
# Create Next.js project
npx create-next-app@latest battle-simulator --typescript --tailwind --eslint --app --src-dir

cd battle-simulator

# Install dependencies
npm install zustand recharts framer-motion

# Install Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card progress tabs badge tooltip

# Testing library (untuk test damage formulas)
npm install -D vitest @testing-library/react

# Run development
npm run dev
```

---

## UI Mockup Concept

```
┌────────────────────────────────────────────────────────────┐
│  BATTLE SIMULATOR                              [Settings]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              ENEMY: Phantylia                       │  │
│  │              HP: ████████████░░░░░ 1,245,000       │  │
│  │              Weakness: ⚡ Lightning                 │  │
│  │              Debuffs: [DEF -30%] [Imprisoned]       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ Acheron │ │ Sparkle │ │ Jiaoqiu │ │  Fu Xuan│         │
│  │ HP:100% │ │ HP:100% │ │ HP:95%  │ │ HP:100% │         │
│  │ E:85/120│ │ E:42/120│ │ E:120✓  │ │ E:90/120│         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                            │
│  TURN ORDER: [Jiaoqiu] > [Sparkle] > [Acheron] > [Boss]   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [Basic ATK]  [Skill]  [Ultimate ✓]  [End Turn]      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌────────────── BATTLE LOG ────────────────────────────┐ │
│  │ Turn 5: Acheron uses Ultimate                        │ │
│  │   > Damage: 485,230 (CRIT)                          │ │
│  │   > Slashed Dream active: +30% DMG                   │ │
│  │ Turn 4: Sparkle uses Skill on Acheron               │ │
│  │   > Acheron: +50% CRIT DMG, Action Advanced         │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Priority Features untuk MVP

1. ✅ Damage Calculator dengan formula akurat
2. ✅ Basic battle flow (select action -> see result)
3. ✅ 5-10 karakter populer dengan data lengkap
4. ✅ 3-5 boss MoC populer
5. ❌ Ghost Mode (Phase 2)
6. ❌ Community sharing (Phase 3)
