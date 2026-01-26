# Yaniv Score Tracker — Style Guide

## Design Direction: "Vintage Vegas Casino"

**Concept:** Retro casino floor meets classic card table. The intimate warmth of a private game room — emerald felt, soft golden lighting, brass fixtures, and the quiet confidence of a well-run establishment. This isn't flashy Vegas Strip; it's the back room where serious players keep score.

**Emotional Keywords:** Warm, Sophisticated, Trustworthy, Playful-but-refined, Nostalgic, Tactile

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Felt Green (Deep)** | `#0B3D2E` | Main background, primary surface |
| **Felt Green (Light)** | `#0F5740` | Card surfaces, elevated elements |
| **Felt Green (Highlight)** | `#14785A` | Hover states, subtle highlights |

### Accent Colors — Gold/Brass

| Name | Hex | Usage |
|------|-----|-------|
| **Brass Dark** | `#8B6914` | Button shadows, borders |
| **Brass Mid** | `#C9972D` | Primary buttons, active elements |
| **Brass Light** | `#E5B94A` | Button highlights, glow effects |
| **Brass Pale** | `#F4D68C` | Text on dark, subtle accents |

### Accent Colors — Card Suits

| Name | Hex | Usage |
|------|-----|-------|
| **Card Red** | `#C41E3A` | Hearts, Diamonds |
| **Card Black** | `#1A1A1A` | Spades, Clubs |
| **Card Red (Muted)** | `#8B1E3A` | Decorative red elements |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Cream** | `#F5F0E1` | Primary text on dark backgrounds |
| **Cream (Muted)** | `#D4CBBA` | Secondary text |
| **Shadow** | `#041F17` | Deep shadows, overlays |

### CSS Custom Properties

```css
:root {
  /* Felt Greens */
  --color-felt-deep: #0B3D2E;
  --color-felt-mid: #0F5740;
  --color-felt-light: #14785A;

  /* Brass/Gold */
  --color-brass-dark: #8B6914;
  --color-brass-mid: #C9972D;
  --color-brass-light: #E5B94A;
  --color-brass-pale: #F4D68C;

  /* Card Suits */
  --color-card-red: #C41E3A;
  --color-card-black: #1A1A1A;
  --color-card-red-muted: #8B1E3A;

  /* Neutrals */
  --color-cream: #F5F0E1;
  --color-cream-muted: #D4CBBA;
  --color-shadow: #041F17;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #EAB308;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

---

## Typography

### Font Stack

**Display Font (Headings, Logo):**
```css
font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
```
- Used for: Main title "YANIV", section headings
- Weight: 700 (Bold) for titles, 600 (SemiBold) for headings

**Body Font (UI, Buttons, Text):**
```css
font-family: 'Crimson Pro', Georgia, serif;
```
- Used for: Buttons, labels, body text, scores
- Weight: 400 (Regular), 500 (Medium), 600 (SemiBold)

**Monospace (Scores, Numbers):**
```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
```
- Used for: Score displays, round numbers, statistics
- Ensures numbers align properly in tables

### Font Import (add to layout.tsx or globals.css)
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Crimson+Pro:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| **Display XL** | 4rem (64px) | 1.1 | Main logo "YANIV" |
| **Display** | 2.5rem (40px) | 1.2 | Page titles |
| **Heading 1** | 1.75rem (28px) | 1.3 | Section headers |
| **Heading 2** | 1.25rem (20px) | 1.4 | Card titles, player names |
| **Body Large** | 1.125rem (18px) | 1.5 | Primary buttons |
| **Body** | 1rem (16px) | 1.5 | Default text |
| **Body Small** | 0.875rem (14px) | 1.5 | Secondary text, labels |
| **Caption** | 0.75rem (12px) | 1.4 | Hints, timestamps |

### Text Styles

```css
/* Display title with glow */
.text-display {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-shadow: 0 0 30px rgba(229, 185, 74, 0.5);
}

/* Button text */
.text-button {
  font-family: 'Crimson Pro', serif;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Score numbers */
.text-score {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
```

---

## Spacing System

Use a consistent 4px base unit:

| Name | Value | Usage |
|------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Small gaps, inline spacing |
| `space-3` | 12px | Default padding |
| `space-4` | 16px | Card padding, button padding |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Large gaps |
| `space-8` | 32px | Section margins |
| `space-10` | 40px | Page sections |
| `space-12` | 48px | Major sections |

---

## Components

### Buttons

#### Primary Button (Gold/Brass)
```
- Background: Linear gradient from brass-light to brass-mid
- Border: 2px solid brass-pale (30% opacity)
- Text: Shadow color (dark), uppercase, tracking-wide
- Shadow: 0 4px 0 brass-dark, subtle ambient shadow
- Hover: Lighten gradient, increase glow
- Active: Reduce shadow to 2px, translate Y +2px
- Focus: 2px outline brass-pale, 2px offset
```

#### Secondary Button (Felt Green)
```
- Background: Linear gradient from felt-light to felt-mid
- Border: 2px solid brass-pale (20% opacity)
- Text: Cream color, uppercase, tracking-wide
- Shadow: 0 3px 0 felt-deep
- Hover: Lighten gradient
- Active: Reduce shadow, translate Y
- Focus: 2px outline brass-pale
```

#### Disabled State
```
- Opacity: 50%
- Cursor: not-allowed
- No hover/active effects
```

### Cards/Panels

#### Main Card (Table Surface)
```css
.card-table {
  background: var(--color-felt-mid);
  border: 3px solid rgba(201, 151, 45, 0.3);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -4px 20px rgba(0, 0, 0, 0.3);
}
```

#### Elevated Card (Floating Elements)
```css
.card-elevated {
  background: var(--color-felt-light);
  border: 2px solid rgba(201, 151, 45, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

### Input Fields

```css
.input-field {
  background: rgba(11, 61, 46, 0.8);
  border: 2px solid rgba(201, 151, 45, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--color-cream);
  font-family: 'Crimson Pro', serif;
}

.input-field:focus {
  border-color: var(--color-brass-light);
  outline: none;
  box-shadow: 0 0 0 3px rgba(229, 185, 74, 0.2);
}

.input-field::placeholder {
  color: var(--color-cream-muted);
  opacity: 0.6;
}
```

### Score Display

```css
.score-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  font-weight: 500;
  background: linear-gradient(135deg, var(--color-felt-deep), var(--color-shadow));
  border: 2px solid rgba(201, 151, 45, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--color-brass-pale);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

## Textures & Effects

### Felt Texture
Use a subtle noise overlay to simulate felt fabric:

```css
.felt-texture {
  position: relative;
}

.felt-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

### Ambient Glow
Soft golden glow to simulate warm casino lighting:

```css
.ambient-glow {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(
    ellipse at center,
    rgba(201, 151, 45, 0.15) 0%,
    rgba(201, 151, 45, 0.05) 40%,
    transparent 70%
  );
  pointer-events: none;
}
```

### Neon Glow (for titles)
```css
.neon-glow {
  text-shadow:
    0 0 10px rgba(229, 185, 74, 0.8),
    0 0 20px rgba(229, 185, 74, 0.6),
    0 0 40px rgba(229, 185, 74, 0.4),
    0 0 80px rgba(229, 185, 74, 0.2);
}
```

### Card Suit Decorations
```css
.suit-decoration {
  font-size: 2.5rem;
  opacity: 0.15;
  user-select: none;
}

.suit-hearts, .suit-diamonds {
  color: var(--color-card-red-muted);
}

.suit-spades, .suit-clubs {
  color: var(--color-card-black);
}
```

---

## Animations

### Subtle Flicker (Neon Sign Effect)
```css
@keyframes flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  96% { opacity: 0.9; }
  97% { opacity: 1; }
}

/* Use sparingly - only on main title */
.animate-flicker {
  animation: flicker 4s infinite;
}
```

### Button Press
```css
@keyframes button-press {
  0% { transform: translateY(0); }
  50% { transform: translateY(2px); }
  100% { transform: translateY(0); }
}
```

### Score Update
```css
@keyframes score-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.score-updated {
  animation: score-pop 0.3s ease-out;
}
```

### Card Entrance (staggered)
```css
@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: card-enter 0.4s ease-out forwards;
}
```

### False Yaniv Alert
```css
@keyframes alert-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.alert-false-yaniv {
  animation: alert-shake 0.5s ease-out;
  border-color: var(--color-error) !important;
}
```

---

## Iconography

### Card Suits
Use Unicode characters for suits, styled appropriately:

| Suit | Character | Filled Alt |
|------|-----------|------------|
| Hearts | ♥ | ♥︎ |
| Diamonds | ♦ | ♦︎ |
| Clubs | ♣ | ♣︎ |
| Spades | ♠ | ♠︎ |

### UI Icons
For other icons, use Lucide React (already compatible with Next.js):

```bash
npm install lucide-react
```

Recommended icons:
- `Plus` — Add player
- `Minus` — Remove player
- `RotateCcw` — Undo
- `Trophy` — Winner
- `Crown` — Leading player
- `Settings` — House rules
- `History` — Round history
- `ChevronDown` — Expand/collapse

---

## UX & Usability Guidelines

### 1. Touch Targets
- Minimum button height: 48px (mobile-friendly)
- Minimum touch target: 44x44px
- Adequate spacing between interactive elements (min 8px)

### 2. Visual Hierarchy
- Primary action (New Game) should be largest, most prominent
- Secondary actions (Continue Game) should be clearly subordinate
- Destructive actions (End Game) should require confirmation

### 3. State Communication

| State | Visual Treatment |
|-------|------------------|
| **Disabled** | 50% opacity, no hover effects |
| **Loading** | Subtle pulse animation, spinner if >1s |
| **Error** | Red border, shake animation, error message |
| **Success** | Green flash, checkmark icon |
| **Active/Selected** | Brass border, subtle glow |

### 4. Button States for "Continue Game"
```jsx
// When no saved game exists:
<button disabled className="opacity-50 cursor-not-allowed">
  No Saved Game
</button>

// When saved game exists:
<button>
  Continue Game
  <span className="text-xs opacity-70">Round 5 • 4 Players</span>
</button>
```

### 5. Score Input UX
- Large, easy-to-tap number inputs
- Show running total as user enters scores
- Visual indicator of who called Yaniv
- Clear distinction between "enter hand total" and "calculated score"

### 6. Feedback & Confirmation
- Haptic feedback on mobile for score submission (if supported)
- Visual flash when scores update
- Confirmation modal for ending game early
- Toast notifications for undo actions

### 7. Accessibility
- All interactive elements must have focus states
- Color is never the only indicator (use icons/text too)
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- Screen reader labels for decorative elements

### 8. Mobile Considerations
- Scoreboard should be scrollable if many players
- Input fields should not cause layout shift when keyboard appears
- Consider landscape orientation for score entry
- Sticky header with current game status

---

## Component Specifications

### Home Page
```
┌─────────────────────────────────┐
│                                 │
│          [YANIV LOGO]           │  ← Neon glow, Playfair Display
│         Score Keeper            │  ← Crimson Pro, brass color
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   ♦              ♣        │  │  ← Corner suit decorations
│  │                           │  │
│  │   ╔═══════════════════╗   │  │
│  │   ║  DEAL NEW GAME    ║   │  │  ← Primary button, full width
│  │   ╚═══════════════════╝   │  │
│  │                           │  │
│  │   ┌───────────────────┐   │  │
│  │   │ Continue Game     │   │  │  ← Secondary button
│  │   │ Round 5 • 4 Players│  │  │  ← Subtext showing saved state
│  │   └───────────────────┘   │  │
│  │                           │  │
│  │   ────── Est. 2026 ────── │  │  ← Decorative divider
│  │                           │  │
│  │   ♠              ♥        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│        ♥  ♦  ♣  ♠              │  ← Subtle animated suits
│                                 │
└─────────────────────────────────┘
```

### Score Entry Screen
```
┌─────────────────────────────────┐
│  ← Back          Round 5        │  ← Sticky header
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │  CURRENT SCORES         │    │
│  ├────────┬────────────────┤    │
│  │ Alice  │           45   │    │
│  │ Bob    │           32   │    │  ← Monospace numbers
│  │ Carol  │           67   │    │
│  │ Dan    │           28   │    │  ← Lowest highlighted
│  └────────┴────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ENTER HAND TOTALS      │    │
│  │                         │    │
│  │  Who called Yaniv?      │    │
│  │  [ Alice ▼ ]            │    │  ← Dropdown
│  │                         │    │
│  │  Alice:  [ 4  ]  ← Yaniv│    │  ← Input + indicator
│  │  Bob:    [ 12 ]         │    │
│  │  Carol:  [ 8  ]         │    │
│  │  Dan:    [ 23 ]         │    │
│  │                         │    │
│  │  ╔═══════════════════╗  │    │
│  │  ║  SUBMIT ROUND     ║  │    │
│  │  ╚═══════════════════╝  │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

---

## File Structure for Styles

```
yaniv-score-tracker/
├── app/
│   ├── globals.css          # CSS custom properties, base styles
│   └── layout.tsx           # Font imports
├── components/
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── ScoreBadge.tsx
│       └── SuitDecoration.tsx
├── lib/
│   └── cn.ts               # Utility for className merging
└── docs/
    └── STYLE_GUIDE.md      # This file
```

---

## Implementation Checklist

### Immediate Improvements to Current Demo

- [ ] Update color palette to refined values
- [ ] Import and apply proper fonts (Playfair Display, Crimson Pro)
- [ ] Fix spade color (currently gray, should be black)
- [ ] Improve felt texture (use noise instead of cross pattern)
- [ ] Add focus states to all interactive elements
- [ ] Make "Continue Game" show disabled state or saved game info
- [ ] Refine shadow depths and glow intensities
- [ ] Add subtle entrance animation
- [ ] Improve flicker animation timing (less frequent)

### Before Day 2 Implementation

- [ ] Create reusable Button component with variants
- [ ] Create Card/Panel component
- [ ] Create Input component with proper styling
- [ ] Set up CSS custom properties in globals.css
- [ ] Create utility components (SuitDecoration, Divider)

---

## Design Tokens (Tailwind Config Extension)

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        felt: {
          deep: '#0B3D2E',
          mid: '#0F5740',
          light: '#14785A',
        },
        brass: {
          dark: '#8B6914',
          mid: '#C9972D',
          light: '#E5B94A',
          pale: '#F4D68C',
        },
        card: {
          red: '#C41E3A',
          black: '#1A1A1A',
          'red-muted': '#8B1E3A',
        },
        cream: {
          DEFAULT: '#F5F0E1',
          muted: '#D4CBBA',
        },
        shadow: '#041F17',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Crimson Pro', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'button-primary': '0 4px 0 #8B6914, 0 6px 20px rgba(0, 0, 0, 0.3)',
        'button-primary-active': '0 2px 0 #8B6914',
        'card-table': '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'neon-gold': '0 0 10px rgba(229, 185, 74, 0.8), 0 0 20px rgba(229, 185, 74, 0.6), 0 0 40px rgba(229, 185, 74, 0.4)',
      },
    },
  },
};
```

---

*Last updated: January 2026*
*Design System Version: 1.0*
