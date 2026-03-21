# ForgeBot marketing landing page — design spec

Implementation: [`src/app/page.tsx`](../src/app/page.tsx). Tokens: [`src/app/globals.css`](../src/app/globals.css), [`tailwind.config.ts`](../tailwind.config.ts). Brand serif: [`src/app/layout.tsx`](../src/app/layout.tsx) (`IBM_Plex_Serif` → `--font-brand-serif`).

## Brand & palette (light)

- **Base:** Sand / warm beige — `--cream` (`hsl(40 22% 92%)`).
- **Tints:** `--cream-well`, `--cream-warm` for bands and icon wells; `--cream-card` for elevated cards (warm paper, not stark white).
- **Accent:** Dark olive — `--olive` / `--olive-deep` / `--olive-foreground` (~`#4B4B36` / `#3F3F2D` range). Use for highlights, CTAs, icons, and **emphasized words** in hero and closing CTA.
- **Text:** `text-zinc-900` headings; `text-zinc-600` body; `text-zinc-500` labels.
- **Borders:** `border-zinc-900/[0.06]`–`[0.1]` on white cards — subtle depth, no heavy rules.

The previous dark “void / forge orange” look is **not** used on the landing page.

## Typography

- **ForgeBot wordmark (nav + footer):** `font-brand` → IBM Plex Serif (`--font-brand-serif`).
- **UI body:** Inter (`font-sans`) via root layout.

## Tagline

Exact copy:

> **Forge your next business from scratch.**

Hero eyebrow: uppercase, tracking, `text-olive`.

## Marketing copy

- **Headline:** Turn **any object** (olive) into a full startup (dark).
- **Subhead:** Same meaning; olive **medium** on key nouns (photo, startup concept, landing page, marketing campaign).
- **Primary CTA:** **Upload photo** + `Camera`, `bg-olive`, rounded-full.
- **How it works:** Four Mac-style **tall cards** (large radius ~`1.75rem`, `cream-card` surface, label + bold title + body, sand-toned icon well). No decorative **+** controls that only mirror login.
- **Features:** Same rounded card language; olive rule; no **+** controls.
- **Closing CTA:** Headline uses olive on **forge** and **next launch**; olive button.
- **Forbidden:** “AI agents”, hackathon, model names in features.

## Gradients

- Hero: full-width vertical **cream → cream-warm** only (no orange).
- Avoid full-width gray separator bars; use spacing + optional section `bg-cream-warm/50` for soft contrast.

## Acceptance

- [ ] Light cream background; dark text; olive accents only (no orange on landing).
- [ ] ForgeBot uses serif brand font.
- [ ] How-it-works matches tall card pattern with + affordance.
- [ ] Copy rules satisfied; `npm run build` succeeds.
