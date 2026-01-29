# UX/UI Audit: Yaniv Score Tracker

## Quick Wins (Start Here)

| Priority | Item | Location | Fix |
|----------|------|----------|-----|
| ⭐⭐⭐ | Add hover states to all buttons | Throughout | `hover:brightness-110` or gradient shift |
| ⭐⭐⭐ | Modal fade-in animation | `play/page.tsx:493` | Add opacity 0→1 + scale 0.95→1 transition |
| ⭐⭐⭐ | Reserve space for crown/star icons | `play/page.tsx:423-431` | Use `min-w-[1rem]` for icon slot to prevent shift |
| ⭐⭐ | Crossfade round scores ↔ hand scores | `play/page.tsx:403-404` | CSS transition on value change |
| ⭐⭐ | Increase Exit/Cancel touch targets | `play/page.tsx:308, 614` | Add `px-2 py-1 -mx-2 -my-1` for 44px min |
| ⭐⭐ | Add empty state hint for first round | `play/page.tsx:387` | Show "Tap below to add first round" |
| ⭐ | Animate progress dots filling | `play/page.tsx:624-641` | Scale pulse when dot activates |
| ⭐ | Standardize border-radius | Throughout | Pick 3 sizes: sm/md/lg |

---

## 1. Transitions & Animations

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 1.1 | No entrance animation for score input modal | `play/page.tsx:493` | Add fade-in + scale-up (0.95→1) |
| 1.2 | Player slide animation uses inline styles | `play/page.tsx:690-698` | Use CSS classes for GPU-accelerated animation |
| 1.3 | Warning dialogs appear abruptly | `play/page.tsx:528, 570` | Add scale 0.9→1 + backdrop blur fade |
| 1.4 | Progress dots lack transition | `play/page.tsx:624-641` | Add `transition-all duration-300` + scale pulse |
| 1.5 | Tally screen appears without entrance | `play/page.tsx:328` | Stagger: header → avatars → totals → rows |
| 1.6 | "Hand" mode toggle is instant | `play/page.tsx:403-404` | Crossfade values |
| 1.7 | Step transitions lack polish | `game/new/page.tsx` | Add horizontal slide between steps |

---

## 2. Button States & Interactions

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 2.1 | No hover on primary CTAs | Throughout | `hover:brightness-110` or gradient shift |
| 2.2 | Numeric keypad lacks active depth | `play/page.tsx:726-737` | `active:translate-y-[2px]` + reduce shadow |
| 2.3 | "Exit" link no hover | `play/page.tsx:308-318` | Underline or color shift |
| 2.4 | Player select buttons no hover | `play/page.tsx:657-680` | `hover:border-[#E5B94A]/50` + scale |
| 2.5 | Backspace button blends in | `play/page.tsx:762-770` | Different background or icon |
| 2.6 | +/- buttons need hover | `game/new/page.tsx:313-327` | `hover:bg-[#B8860B]` |
| 2.7 | "Continue Game" no hover | `page.tsx:111-125` | Brightness or glow effect |

---

## 3. Optical Alignment & Spacing

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 3.1 | "Tot." label misaligned | `play/page.tsx:366-369` | Use `items-baseline` |
| 3.2 | Round labels not centered | `play/page.tsx:402-405` | Proper line-height matching |
| 3.3 | Crown/star icons cause jumping | `play/page.tsx:423-431` | Reserve `min-w-[1rem]` for icon slot |
| 3.4 | Player avatars uneven spacing | `play/page.tsx:337-362` | Use `justify-around` or fixed gaps |
| 3.5 | Score shifts with minus sign | `play/page.tsx:716-717` | Absolute position the minus |
| 3.6 | Progress bar gaps inconsistent | `game/new/page.tsx:140-153` | Consistent `gap-1.5` |

---

## 4. Touch Targets & Accessibility

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 4.1 | Exit link too small | `play/page.tsx:308-318` | Add `px-2 py-1 -mx-2 -my-1` |
| 4.2 | Cancel button too small | `play/page.tsx:614-619` | 44px minimum touch target |
| 4.3 | Round rows need tap affordance | `play/page.tsx:394-451` | Hint on first load |
| 4.4 | House rules lack focus states | `game/new/page.tsx:277-340` | `focus-visible:ring-2` |
| 4.5 | Warning buttons need focus | `play/page.tsx:545-563` | Focus-visible outline |

---

## 5. Visual Feedback & Micro-Interactions

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 5.1 | No feedback on number input | `play/page.tsx:726` | Scale pulse 1→1.05→1 |
| 5.2 | Avatar doesn't react on select | `play/page.tsx:657-680` | Glow/pulse on selection |
| 5.3 | No celebration for round completion | After `showRawScores` | Subtle burst effect |
| 5.4 | Leader crown is static | `play/page.tsx:423-424` | Subtle float animation |
| 5.5 | Input underline could animate | `play/page.tsx:719` | Width animate from center |

---

## 6. Typography & Readability

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 6.1 | Score weight distinction weak | `play/page.tsx:376-378` | Winner = font-black |
| 6.2 | "Tot." abbreviation unclear | `play/page.tsx:368` | Use "Total" smaller or icon |
| 6.3 | Red penalty hard to read | `play/page.tsx:440-441` | Brighter red or text-shadow |
| 6.4 | Long names truncate badly | `game/new/page.tsx:558-560` | Add `truncate` |

---

## 7. Empty States & Edge Cases

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 7.1 | No empty state before R1 | `play/page.tsx:387` | "Tap below to add first round" |
| 7.2 | No max rounds warning | `play/page.tsx:320-324` | Warning color approaching limit |
| 7.3 | Score limit warning needed | `play/page.tsx` | Amber highlight within 20 of max |

---

## 8. Consistency

| # | Issue | Suggestion |
|---|-------|------------|
| 8.1 | Inconsistent border-radius | Standardize: sm (8px), md (12px), lg (16px) |
| 8.2 | Inconsistent shadow depths | Create utility classes |
| 8.3 | Random opacity values | Use only: 0.1, 0.2, 0.4, 0.6, 0.8 |
| 8.4 | Felt texture opacity varies | Pick one: 0.03 or 0.04 |
| 8.5 | Button tracking varies | `tracking-wide` for all CTAs |
| 8.6 | Gold button no active state | Reduce shadow on press |

---

## 9. Performance

| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 9.1 | Counter uses setInterval | `play/page.tsx:179-228` | Use `requestAnimationFrame` |
| 9.2 | Nested setTimeout chains | `play/page.tsx:165-232` | Refactor to CSS animations |
| 9.3 | Score transition lacks easing | `play/page.tsx:376` | `transition-all duration-200 ease-out` |

---

## Implementation Order

1. **Session 1**: Quick Wins (hover states, modal animation, icon spacing, touch targets)
2. **Session 2**: Transitions & Animations (modal entrance, slide polish, crossfades)
3. **Session 3**: Alignment & Consistency (spacing, typography, standardization)
4. **Session 4**: Micro-interactions & Edge Cases (feedback, empty states, warnings)
