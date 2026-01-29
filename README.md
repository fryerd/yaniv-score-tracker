# Yaniv Score Tracker

A mobile-friendly web app for tracking scores in the card game **Yaniv**. Built with Next.js, TypeScript, and Tailwind CSS.

<!-- TODO: Add your deployed URL here -->
<!-- **Live Demo:** [yaniv-score-tracker.vercel.app](https://yaniv-score-tracker.vercel.app) -->

## Screenshots

<p align="center">
  <img src="public/screenshots/home.png" width="200" alt="Home Screen" />
  <img src="public/screenshots/game-setup.png" width="200" alt="Game Setup" />
  <img src="public/screenshots/gameplay.png" width="200" alt="Gameplay" />
  <img src="public/screenshots/results.png" width="200" alt="Results" />
</p>

> **Note:** Add your own screenshots to `public/screenshots/` - capture from your phone for best results!

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

### Data & Persistence
- **Auto-save** - Game state persists in browser localStorage
- **Continue game** - Resume your game even after closing the browser
- **Mobile-first design** - Optimized for use at the card table

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
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
│   └── game/
│       ├── new/page.tsx   # Game setup wizard
│       └── play/page.tsx  # Active game screen
├── lib/
│   └── store.ts           # Zustand store + scoring logic
├── types/
│   └── game.ts            # TypeScript interfaces
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

This app is designed to be deployed on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy!

The app works entirely client-side with localStorage, so no backend or database setup is required.

## Roadmap (Future Ideas)

- [ ] PWA support (install on phone home screen)
- [ ] Game history (view past completed games)
- [ ] Share game via link
- [ ] Backend/database for cross-device sync
- [ ] Player statistics over multiple games
- [ ] Dark/light theme toggle

## License

MIT

## Acknowledgments

- Built as a learning project to explore React, Next.js, and TypeScript
- Card game scoring logic inspired by traditional Yaniv rules
- UI design inspired by casino felt aesthetics
