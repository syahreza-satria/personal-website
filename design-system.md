# Project Showcase — Design System

The visual language of syahreza-satria.xyz: a light paper page, oversized display type, pill navigation, ink cards and a single orange accent. The work sits up front; decoration is left out.

Source of truth: tokens in `@theme` in [src/app/globals.css](src/app/globals.css), motion tokens in [src/constants/animation.js](src/constants/animation.js). This file explains how to use them. Visual references for the redesign are in `design-reference/` (mockup HTML, not app code).

## Colour

Use the Tailwind utilities generated from these tokens (`bg-paper`, `text-ink`, `bg-accent`, …). Never raw hex in components, and never Tailwind palette colours (`neutral-*`, `emerald-*`, `green-*`, …).

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#EFEFEC` | Page background |
| `surface` | `#FFFFFF` | Light cards, inputs, inactive nav pills |
| `ink` | `#111111` | Body text, dark cards, active pills, rules |
| `muted` | `#4A4A46` | Secondary text |
| `subtle` | `#6B6B66` | Placeholders, image fallbacks |
| `line` | `#CFCFC9` | Thin dividers, quiet outlines |
| `accent` | `#FF5A1F` | The only accent: Contact pill, CTA blocks, "Live" status, cursor follower, active reactions |
| `on-ink` | `#EFEFEC` | Text on ink surfaces |
| `on-ink-muted` | `#D6D6D0` | Secondary text on ink |
| `on-ink-subtle` | `#B5B5AF` | Tertiary text on ink |
| `ink-line` | `#33332F` | Dividers on ink |
| `destructive` | `#C62828` | Delete buttons only (`text-white` allowed here) |

Rules

- One accent. Do not introduce a second hue for "creative" or "dev"; the type tags are told apart by their words.
- Text on `accent` is always `ink`, never white.
- No gradients, glows, blur or large shadows.
- `accent` and `muted` are also the shadcn `--accent` / `--muted` variables, so `ui/Input` and `ui/Select` follow the palette automatically.

## Typography

| Role | Face | Weight | Notes |
| --- | --- | --- | --- |
| Display (`font-display`) | Bricolage Grotesque, variable | 700 / 800 | Page titles, card titles, the wordmark. Loaded without a `weight` list so the hero can animate the `wght` axis |
| Body (`font-sans`) | DM Sans | 400 / 500 / 600 | Everything else |

- Giant titles: `leading-[0.86]`, `tracking-[-0.05em]`, sizes with `clamp()` (Home hero `clamp(64px,14vw,200px)`, `PageHeader` `clamp(56px,11vw,160px)`).
- Page titles end in an accent full stop ("About.", "Gears.") or the accent × on Home.
- Section headings: display 40–48px, `tracking-[-0.03em]`.
- Body copy 15–20px, `leading-normal` or 1.6–1.7 for longer paragraphs.

## Shape & spacing

| Element | Shape |
| --- | --- |
| Nav items, buttons, tags, chips, search inputs | Pill (`rounded-full`), min height 44px (`min-h-11`) |
| Cards | `rounded-card` (20px) |
| Larger cards, panels | `rounded-panel` (24px) |
| Big blocks (contact CTA, next-project) | `rounded-block` (32px) |
| Cover images | `rounded-[28px]` |
| Section rules | 2px ink (`DrawRule`, or `border-t-2 border-ink`) |
| List rows | 1.5px ink top border |
| Outline tags | 1.5px ink border |

Layout: one centred column, `max-w-[1240px] mx-auto px-5`. Grids use `repeat(auto-fit, minmax(min(320px,100%), 1fr))` so they collapse to one column on phones without breakpoints.

## Components

All in `src/components/custom/`.

| Component | Purpose |
| --- | --- |
| `SiteHeader` | Wordmark + nav pills (active = ink, Contact = accent). Below `lg`: "Menu" pill opening a full-screen ink dialog that grows as a circle from the button |
| `Footer` | Social links, CV, language toggle, small Login / Logout link |
| `PageHeader` | Giant title + accent dot, intro, drawn 2px rule |
| `HeroTitle` | Home hero: letter reveal, spinning ×, cursor-driven weight |
| `FilterPills` | Single-choice pill row with a sliding ink indicator |
| `Badge` | Dev / Creative / Hybrid as a 1.5px outline pill; `tone="ink"` on dark cards |
| `SkillChip` | Outline skill pill; magnetic lean and accent fill on hover (fine pointer only) |
| `Reveal`, `RevealItem` | Scroll-triggered entrance, optional stagger |
| `DrawRule` | Divider that draws in from the left |
| `SplitReveal` | Letter-by-letter reveal behind a mask |
| `CursorFollower` | Accent "View →" circle over any `data-cursor="view"` element |
| `MotionLink` | Card link that drives the `imageZoom` hover |
| `PreviewDialog` | Image lightbox (gallery, certificates, gear) |
| `AdminButtons` | `AdminActions` (edit / delete) and `AddButton` |
| `CrudModal`, `ProjectForm`, `form-styles.js` | Admin forms and their shared field classes |

Status pills on project cards: white pill with a dot — Live = accent dot, Completed = ink dot, In Progress and Design Phase = dashed outline dot, anything else = solid outline dot. Always map with `getStatusConfig` from `constants/projects.js`.

Guestbook: other people's messages on `surface`, the viewer's own on `ink` (right-aligned); a reaction the viewer added is `bg-accent`.

## Motion

Library: Framer Motion, imported from `framer-motion` everywhere. All tokens live in `src/constants/animation.js`; add new ones there instead of tuning per component.

| Token | Value | Use |
| --- | --- | --- |
| `ease` | `[0.22, 1, 0.36, 1]` | Default easing |
| `duration` | fast 0.18 · base 0.3 · slow 0.5 s | Default durations |
| `spring` | stiffness 380, damping 32 | Small UI: indicators, pills |
| `parent` / `child` | stagger 0.08 s, y 14 | Page-level entrance |
| `revealUp`, `revealViewport` | y 24 → 0, once, 25% visible | Scroll reveal |
| `drawLine` | scaleX 0 → 1, 0.9 s | `DrawRule` |
| `splitLetter`, `splitStagger` | y 135% → 0, 0.03 s per letter | `SplitReveal` |
| `idleSpin`, `hoverSpin` | 20 s per turn; spring on hover | Hero × |
| `weightFollow` | 800 near → 500 at 220px | Hero cursor weight |
| `cursorSpring` | stiffness 500, damping 40 | `CursorFollower` |
| `imageZoom` | scale 1.04, 0.5 s | Card image hover |
| `magnetSpring`, `magnetStrength` | 0.35 of the cursor offset | `SkillChip` |
| `modalBackdrop`, `modalPanel`, `listItem` | — | Dialogs, filtered grids |

Rules

- Animate `transform`, `opacity` and `clip-path` only.
- `MotionProvider` sets `reducedMotion="user"`. With reduced motion, keep `initial` the same (SSR markup) and make transitions instant or skip the effect; looping and cursor effects are switched off.
- Cursor effects need `useFinePointer()` (false until hydrated) so they never run on touch devices.
- Don't wrap something in `Reveal` that already animates in with its parent.
- Split text keeps the full string in an `sr-only` span; letter spans are `aria-hidden`.

## Accessibility

- Text contrast at least 4.5:1. `ink`, `muted` and `subtle` on `paper` / `surface`, and the `on-ink-*` colours on `ink`, all pass. `accent` on `paper` does not pass for small text: use it for fills, large display marks (the × and title dots) and the cursor, never for body copy or small labels.
- 44px minimum touch targets.
- Global `:focus-visible` outline: 2px ink, offset 3px; flips to `on-ink` inside `bg-ink` / `data-surface="ink"`. Don't add `outline-none` without drawing a replacement ring.
- `aria-current="page"` on the active nav item; `aria-pressed` on filter pills.
- Dialogs go through `useDialog` (focus moved in, Tab trapped, Esc closes, scroll locked, focus restored).
- Admin controls sit next to a card's link, never inside it.

## Voice

Short and plain. Titles are a word or two ("Work", "About."); intros are one sentence. All interface text is wrapped in `t()` with an Indonesian entry in `constants/translations.js`.
