# Yaniv Score Tracker

A mobile-friendly web app for tracking scores in the card game **Yaniv**. Built with Next.js, TypeScript, and Tailwind CSS.

**[Try it live](https://yaniv-score-tracker-ten.vercel.app/)** | **[Interactive Scoring Logic Playground](https://fryerd.github.io/yaniv-score-tracker/)**

## Screenshots

| Homepage | Add Players | Enter Scores |
|:--------:|:-----------:|:------------:|
| <img width="250" alt="Homepage" src="https://github.com/user-attachments/assets/70f50a03-aa13-46d2-b055-8b027e4aea99" /> | <img width="250" alt="Game Players" src="https://github.com/user-attachments/assets/aab8c8b3-ef02-4366-9999-a798f0702329" /> | <img width="250" alt="Input hand scores" src="https://github.com/user-attachments/assets/d047f56d-fb17-4ecc-a28d-47fba62b7c60" /> |

| Track Rounds | Celebrate! |
|:------------:|:----------:|
| <img width="250" alt="Keep score" src="https://github.com/user-attachments/assets/9b8a4d9a-6249-4076-af04-c8909b6600e6" /> | <img width="250" alt="Celebrate your Win" src="https://github.com/user-attachments/assets/645aeb7c-131b-438b-b9a4-cb97ddae5edc" />

## 🎮 Interactive Scoring Logic Playground

Explore how the complex Yaniv scoring logic works with our **[interactive playground](https://fryerd.github.io/yaniv-score-tracker/)**!

- ⚙️ Adjust players, hand scores, and house rules
- 👁️ See live visualization of scoring calculations
- 🎯 Try preset scenarios: Normal Win, False Yaniv, 50-Bonus
- 📋 Generate prompts for implementing the logic

Perfect for understanding how False Yanivs, 50-bonuses, and win streaks work under the hood!

## Features

### Game Setup
- **2-8 players** with custom names
- **Configurable house rules:**
  - Maximum score threshold (default: 150)
  - False Yaniv penalty (default: 25 points)
  - End game mode: by high score or fixed rounds
  - Bonus type when hitting multiples of 50 (-25 points or halve score)
  - 3-win streak bonus option

### Gameplay
- **Score entry flow** - Select who called Yaniv, then enter each player's hand total
- **Automatic False Yaniv detection** - If another player has an equal or lower hand, penalty is applied automatically
- **Bonus tracking** - Automatically detects and applies bonuses when players hit exactly 50, 100, 150, etc.
- **Win streak tracking** - Optional bonus for 3 consecutive Yaniv wins
- **Visual indicators:**
  - Crown icon for round winner
  - X icon for False Yaniv caller
  - Star for 50-bonus
  - Fire icon for streak bonus
  - Green ring around current leader
  - Red ring around last place

### Post-Game
- **Animated podium reveal** with confetti celebration
- **Game highlights:**
  - Most successful Yaniv calls
  - Most False Yanivs
  - Lowest/highest individual hands
  - Best/worst rounds
- **Share results** - Copy formatted results to clipboard
- **Tap any round** to see original hand scores

### Auth & Cloud Save
- **Magic link authentication** - Sign in with just your email, no password needed
- **Save finished games** - Tap "Save Game" on the results screen to persist your game to the cloud
- **Shareable game links** - Saved games get a unique URL (e.g. `/game/view/Ab3kX9mN`) that anyone can view
- **Claim your player** - After saving, pick which player you were to link it to your account
- **Zero disruption** - Auth only activates at post-game save; the entire game play loop is unchanged and works offline via localStorage

### Data & Persistence
- **Auto-save** - Game state persists in browser localStorage during play
- **Cloud save** - Optionally save finished games to Supabase for permanent storage
- **Continue game** - Resume your game even after closing the browser
- **Mobile-first design** - Optimized for use at the card table

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Auth & Database:** [Supabase](https://supabase.com/) (magic link auth + Postgres)
- **Testing:** Jest (unit tests) + Playwright (E2E tests)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/fryerd/yaniv-score-tracker.git
cd yaniv-score-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Jest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |

## How to Play Yaniv

Yaniv is an Israeli card game where the goal is to have the **lowest score** when someone else busts (exceeds the max score, typically 150).

### Basic Rules

1. **Starting a round:** Each player is dealt 5 cards
2. **On your turn:** Draw a card (from deck or discard pile), then discard one or more cards
3. **Calling Yaniv:** If your hand total is 5 or less, you can call "Yaniv!" to end the round
4. **Scoring:**
   - If you called Yaniv and have the lowest hand: you score **0 points**
   - Everyone else adds their hand total to their cumulative score
   - **False Yaniv:** If someone else has an equal or lower hand when you call Yaniv, you get a **25-point penalty** and they score 0

### Bonuses

- **50 Bonus:** If your cumulative score lands exactly on 50, 100, 150, etc., your score is reduced by 25 (or halved, depending on house rules)
- **Win Streak:** Some groups play that 3 consecutive Yaniv wins earns a bonus

### Game End

The game ends when a player exceeds the maximum score (default: 150). The player with the **lowest score wins**.

## Project Structure

```
yaniv-score-tracker/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── auth/
│   │   ├── callback/route.ts   # Magic link code exchange
│   │   └── sign-in/page.tsx    # Sign-in page
│   └── game/
│       ├── new/page.tsx        # Game setup wizard
│       ├── play/page.tsx       # Active game screen
│       └── view/[shareToken]/  # Shared game view (read-only)
├── lib/
│   ├── store.ts           # Zustand store + scoring logic
│   ├── actions/           # Server Actions (save game, claim player)
│   ├── hooks/             # React hooks (useAuth, useSaveGame)
│   └── supabase/          # Supabase client utilities
├── types/
│   └── game.ts            # TypeScript interfaces
├── supabase/
│   └── migrations/        # Database schema (SQL)
├── middleware.ts           # Auth session refresh
├── __tests__/             # Jest unit tests
├── e2e/                   # Playwright E2E tests
└── public/
    └── screenshots/       # App screenshots for README
```

## Testing

### Unit Tests (27 tests)

Tests cover the core scoring logic:
- Normal Yaniv scoring
- False Yaniv detection and penalties
- Bonus calculations (50, 100, 150...)
- Win streak bonuses
- Game end conditions
- Edge cases

```bash
npm test
```

### E2E Tests (9 tests)

Tests cover the full user flow:
- Home page navigation
- Game setup (player count, names, house rules)
- Score entry and round completion
- Continue game functionality

```bash
npm run test:e2e
```

## Deployment

This app is deployed on [Vercel](https://vercel.com) with [Supabase](https://supabase.com/) for auth and database.

### Setup

1. **Supabase:** Create a project, run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
2. **Environment variables:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in both `.env.local` and Vercel
3. **Auth URLs:** In Supabase → Authentication → URL Configuration, set your Site URL and add `https://your-domain/auth/callback` as a redirect URL
4. **Deploy:** Push to GitHub and Vercel deploys automatically

The game play loop works entirely client-side with localStorage — Supabase is only used for saving finished games and viewing shared links.

## License

MIT

## Acknowledgments

- Built as a learning project to explore React, Next.js, and TypeScript
- Card game scoring logic inspired by traditional Yaniv rules
- UI design inspired by casino felt aesthetics
