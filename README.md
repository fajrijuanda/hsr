# HSR Tools

Honkai: Star Rail Tools - A comprehensive web application for HSR players featuring:

- **Speed Tuner Visualizer** - Action Value calculator with timeline visualization
- **Battle Simulator** (Coming Soon) - Turn-by-turn combat simulation
- **AI Pull Planner** (Coming Soon) - Personal recommendation based on your account
- **Character Showcase** (Coming Soon) - Relic rating with brutal honesty
- **Lore Graph** (Coming Soon) - Interactive character relationship visualization
- **Dashboard Hub** (Coming Soon) - Banner countdown, code redemption tracker

## Tech Stack

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS, Shadcn/UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Database**: PostgreSQL (port 5433)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (optional, for future features)

### Installation

```bash
# Clone the repository
git clone https://github.com/fajrijuanda/hsr.git
cd hsr

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/hsr_tools"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hsr_tools
POSTGRES_PORT=5433
```

## Features

### Speed Tuner (Available)

- Select from 16+ popular characters
- Adjust speed bonuses (Relic substats, Light Cone, Speed %)
- Real-time timeline visualization
- 6 meta team presets (Acheron, Firefly, DHIL, etc.)
- Boss speed configuration
- Cycle markers for MoC optimization

## Project Structure

```
hsr/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── Controls/        # Control components
│   │   ├── Team/            # Team management
│   │   ├── Timeline/        # Timeline visualizer
│   │   └── ui/              # Shadcn UI components
│   ├── data/                # Static data (characters, etc.)
│   ├── lib/                 # Utilities and calculators
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── blueprint-*.md           # Feature blueprints
└── package.json
```

## Blueprints

Feature blueprints are available in the root directory:

- `blueprint-speed-tuner.md` - Speed Tuner specs
- `blueprint-battle-simulator.md` - Battle Simulator specs
- `blueprint-pull-planner.md` - AI Pull Planner specs
- `blueprint-showcase.md` - Character Showcase specs
- `blueprint-lore-graph.md` - Lore Graph specs
- `blueprint-dashboard.md` - Dashboard Hub specs

## License

MIT
