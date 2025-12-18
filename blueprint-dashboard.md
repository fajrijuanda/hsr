# Blueprint: Dashboard & Utilities Hub

## Deskripsi Fitur

Dashboard utama sebagai landing page yang menggabungkan berbagai utilities populer: **Banner Countdown**, **Code Redemption Tracker**, **Daily Check-in Reminder**, dan quick links ke fitur lainnya.

---

## Core Features

### 1. Banner Countdown

- Countdown timer untuk banner aktif
- Thumbnail karakter featured
- Auto-update berdasarkan server time
- Notification toggle

### 2. Code Redemption Tracker

- List kode aktif dengan copy button
- Status: Active / Expired / New
- Auto-fetch dari community sources
- One-click redeem (deep link ke game)

### 3. Event Calendar

- Calendar view untuk event aktif
- Farming event highlights
- Story event reminders
- Double drop notifications

### 4. Quick Stats

- Resin/Trailblaze Power calc
- Dailies countdown
- Weekly reset countdown
- Version roadmap

---

## Tech Stack

```
Frontend: Next.js 14+, TypeScript, Tailwind, Shadcn
Data Source:
  - Scraping atau API untuk banner data
  - Community Discord/Reddit untuk codes
State: Zustand
Timer: date-fns atau dayjs
```

---

## Folder Structure

```
dashboard/
├── app/
│   ├── page.tsx
│   └── api/
│       ├── banners/route.ts
│       └── codes/route.ts
├── components/
│   ├── Banner/
│   │   ├── BannerCard.tsx
│   │   └── CountdownTimer.tsx
│   ├── Codes/
│   │   ├── CodeList.tsx
│   │   └── CodeCard.tsx
│   ├── Calendar/
│   │   └── EventCalendar.tsx
│   ├── Stats/
│   │   ├── ResinCalc.tsx
│   │   ├── DailyCountdown.tsx
│   │   └── WeeklyReset.tsx
│   └── QuickLinks/
│       └── FeatureGrid.tsx
├── lib/
│   ├── countdown.ts
│   └── server-time.ts
└── data/
    ├── banners.json
    └── events.json
```

---

## Countdown Logic

```typescript
import { differenceInSeconds, format } from "date-fns";

interface BannerData {
  id: string;
  name: string;
  characters: string[];
  startDate: Date;
  endDate: Date;
  phase: string;
}

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(targetDate, now);

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400),
        hours: Math.floor((diff % 86400) / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};
```

---

## Code Tracker

```typescript
interface RedemptionCode {
  code: string;
  rewards: string;
  source: string;
  addedAt: Date;
  expiresAt: Date | null;
  status: "active" | "expired" | "new";
}

const CodeCard = ({ code }: { code: RedemptionCode }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redeemUrl = `https://hsr.hoyoverse.com/gift?code=${code.code}`;

  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div>
        <code className="font-mono font-bold">{code.code}</code>
        <p className="text-sm text-gray-500">{code.rewards}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={copyCode}>{copied ? "✓" : "Copy"}</Button>
        <Button asChild variant="outline">
          <a href={redeemUrl} target="_blank">
            Redeem
          </a>
        </Button>
      </div>
    </div>
  );
};
```

---

## Commands

```bash
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
npm install zustand date-fns
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge
npm run dev
```

---

## UI Layout

```
┌────────────────────────────────────────────────────────┐
│  HSR HUB                           [🌙 Dark Mode]      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐ ┌─────────────────────────┐  │
│  │ CURRENT BANNER      │ │ REDEMPTION CODES        │  │
│  │ ┌─────────────────┐ │ │                         │  │
│  │ │ [Firefly Img]   │ │ │ HSRVER25GIFT   [Copy]  │  │
│  │ │ Firefly & Jade  │ │ │ 60 Jade + 10k Credits  │  │
│  │ │                 │ │ │ ─────────────────────  │  │
│  │ │ Ends in:        │ │ │ STARRAIL500    [Copy]  │  │
│  │ │ 05d 12h 30m 45s │ │ │ 500 Stellar Jade      │  │
│  │ └─────────────────┘ │ │ ─────────────────────  │  │
│  └─────────────────────┘ │ NEW! LIVE2025   [Copy]  │  │
│                          │ 100 Jade + Fuel        │  │
│  ┌─────────────────────┐ └─────────────────────────┘  │
│  │ QUICK TOOLS         │                              │
│  │ [Speed Tuner]       │                              │
│  │ [Battle Sim]        │ ┌─────────────────────────┐  │
│  │ [Showcase]          │ │ DAILY RESET: 03:41:22   │  │
│  │ [Pull Planner]      │ │ WEEKLY RESET: 2d 15h    │  │
│  │ [Lore Graph]        │ └─────────────────────────┘  │
│  └─────────────────────┘                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```
