# Yaniv Score Tracker — Design System

This document defines the visual design system for the Yaniv Score Tracker app.

**Theme:** Vintage Vegas Casino

---

## Quick Reference

### Colors

```css
/* Felt Greens */
--color-felt-deep: #0B3D2E;    /* Main background */
--color-felt-mid: #0F5740;     /* Card surfaces */
--color-felt-light: #14785A;   /* Hover states */

/* Brass/Gold */
--color-brass-dark: #8B6914;   /* Button shadows */
--color-brass-mid: #C9972D;    /* Primary buttons */
--color-brass-light: #E5B94A;  /* Button highlights */
--color-brass-pale: #F4D68C;   /* Text on dark */

/* Card Suits */
--color-card-red: #C41E3A;     /* Hearts, Diamonds */
--color-card-black: #1A1A1A;   /* Spades, Clubs */

/* Neutrals */
--color-cream: #F5F0E1;        /* Primary text */
--color-cream-muted: #D4CBBA;  /* Secondary text */
```

### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** | Headings, logo |
| **Crimson Pro** | Body text, buttons |
| **JetBrains Mono** | Scores, numbers |

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.font-display` | Playfair Display font |
| `.font-body` | Crimson Pro font |
| `.font-score` | Monospace with tabular numbers |
| `.card-table` | Felt green card surface |
| `.text-neon` | Gold neon glow effect |
| `.suit-red` | Red suit color |
| `.suit-black` | Black suit color |
| `.animate-flicker` | Subtle neon flicker |
| `.animate-score-pop` | Score update animation |
| `.texture-felt` | Felt noise texture |

---

## Full Documentation

See **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** for complete documentation including:

- Detailed color palette with hex values
- Typography scale and usage guidelines
- Component specifications (buttons, cards, inputs)
- Animation keyframes and timing
- UX/accessibility guidelines
- Wireframes and layout specs
- Tailwind configuration

---

## Design Principles

1. **Warm & Inviting** — Deep greens and golden accents create an intimate casino atmosphere
2. **Tactile & Real** — Felt textures, embossed buttons, and realistic shadows
3. **Fun but Sophisticated** — Playful card suits, but refined typography
4. **Mobile-First** — Designed for use at the card table on phones
5. **Accessible** — Proper contrast, focus states, and semantic HTML

---

## File Structure

```
app/
├── globals.css          # Design tokens & utilities
├── layout.tsx           # Font imports
└── page.tsx             # Homepage (Vegas theme)

docs/
├── README.md            # This file (quick reference)
└── STYLE_GUIDE.md       # Full design documentation
```
