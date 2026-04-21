# Ace Online BPS Calculator — Design

**Date:** 2026-04-21
**Status:** Approved, ready for implementation

## Goal

A website that computes **bullets per second (BPS)** for Ace Online weapons. The user picks a weapon and its modifiers (prefix, suffix, enchant cards) and sees the resulting BPS. Multiple builds can sit side-by-side on the page so users can compare setups.

v1 ships **A-Gear only**. The data model and calculation engine are generic so B-Gear, I-Gear, and M-Gear can be plugged in later without refactors.

## Scope

**In scope (v1)**
- A-Gear weapons and modifiers
- Four inputs per build: weapon, prefix, suffix, enchant (low card + qty + hyper card + qty)
- Deterministic BPS output (pick exact prefix/suffix, not RNG expected value)
- Multiple build rows on one page, each independent
- Shareable URL — build state encoded in query params
- Weapon image slot per row (placeholder in v1, real art later)

**Out of scope (v1)**
- Other gears (B, I, M) — generic core makes them easy to add later
- DPS / damage modeling
- Ship passives, set bonuses, consumables
- Accounts, named-build saving
- Admin UI for editing data
- i18n
- Probabilistic "expected value" gamble mode

## Formula

For A-Gear:

```
BPS = 3 / (base × (1 + prefix + suffix + enchant))
```

Where:
- `base` is a per-weapon stat (interval/cooldown value; lower = faster)
- `prefix`, `suffix`, `enchant` are stored as signed decimals (negative = faster). `-15%` is stored as `-0.15`.
- `enchant` = `low_card.value × low_qty + hyper_card.value × hyper_qty`
- `3` is an A-Gear-specific constant (other gears will have their own formula module)

**Worked example** — `base=1.5`, `prefix=-0.10`, `suffix=-0.15`, enchant sum `-0.20`:
`BPS = 3 / (1.5 × (1 − 0.45)) = 3 / 0.825 ≈ 3.64`

Actual weapon base values and card values will be supplied before/during implementation.

## Tech stack

- **Next.js (App Router) + TypeScript + Tailwind CSS** — deployed on Vercel
- **Vitest** for unit tests on the calculator
- **Playwright** for one UI smoke test
- **No backend, no database, no auth** — fully static

## Data model

All data lives as typed TypeScript files committed in the repo under `data/`.

```
data/
  types.ts             # shared types
  gears/
    a-gear.ts          # A-Gear weapons + affixes + cards
    b-gear.ts          # added later
    i-gear.ts          # added later
    m-gear.ts          # added later
```

**Shared types** (`data/types.ts`):

```ts
export type Weapon      = { id: string; name: string; base: number };
export type Affix       = { id: string; name: string; value: number }; // -0.15 for -15%
export type EnchantCard = { id: string; name: string; value: number; maxQty: number };

export type Build = {
  weaponId:     string;
  prefixId:     string;
  suffixId:     string;
  lowCardId:    string;
  lowQty:       number;
  hyperCardId:  string;
  hyperQty:     number;
};

export type GearData = {
  id:         "a" | "b" | "i" | "m";
  name:       string;
  weapons:    Weapon[];
  prefixes:   Affix[];
  suffixes:   Affix[];
  lowCards:   EnchantCard[];
  hyperCards: EnchantCard[];
  calculateBPS: (build: Build, data: GearData) => number;
};
```

Each gear file exports its own `GearData` object, including its own `calculateBPS` implementation. Adding a new gear later = add one file; core code does not change.

## Calculation engine

Pure function, no React, fully unit-testable.

```ts
// lib/calc/a-gear.ts
import type { Build, GearData } from "@/data/types";

export function calculateBpsAGear(build: Build, data: GearData): number {
  const weapon    = data.weapons.find(w => w.id === build.weaponId)!;
  const prefix    = data.prefixes.find(p => p.id === build.prefixId)!;
  const suffix    = data.suffixes.find(s => s.id === build.suffixId)!;
  const lowCard   = data.lowCards.find(c => c.id === build.lowCardId)!;
  const hyperCard = data.hyperCards.find(c => c.id === build.hyperCardId)!;

  const enchantModifier =
    lowCard.value   * build.lowQty +
    hyperCard.value * build.hyperQty;

  const totalModifier = prefix.value + suffix.value + enchantModifier;

  return 3 / (weapon.base * (1 + totalModifier));
}
```

**Edge cases handled:**
- `1 + totalModifier ≤ 0` → invalid combo. Row shows `—` and highlights as invalid. No divide-by-zero exception.
- `qty` out of range → clamped to `[0, maxQty]`, input shown red.
- Missing/unknown IDs from URL → fall back to defaults; do not crash.

## UI layout

One row per build. Within a row: dropdowns stacked **vertically** on the left, image in the middle, BPS on the right, delete button at the far right.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Ace Online BPS Calculator                                           │
├──────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬───────────────┬──────────────┬─────┐               │
│  │ Weapon  [▾]  │               │              │     │               │
│  │ Prefix  [▾]  │               │              │     │               │
│  │ Suffix  [▾]  │  [weapon img] │   3.64 b/s   │  ✕  │               │
│  │ Low     [▾]  │               │              │     │               │
│  │ Low qty [ ]  │               │              │     │               │
│  │ Hyper   [▾]  │               │              │     │               │
│  │ Hyper q [ ]  │               │              │     │               │
│  └──────────────┴───────────────┴──────────────┴─────┘               │
│  ┌──────────────┬───────────────┬──────────────┬─────┐               │
│  │   (another build row)                                │             │
│  └──────────────┴───────────────┴──────────────┴─────┘               │
│                                                                      │
│                     [ + Add build ]        [ Copy link ]             │
└──────────────────────────────────────────────────────────────────────┘
```

- `+ Add build` appends a row with default selections.
- `✕` removes a row. Minimum 1 row, soft cap 10.
- On narrow mobile, the image column hides and the result stacks below the inputs.
- No gear selector in v1 — the app is implicitly A-Gear.

## URL state

Each build is serialized as dot-separated fields; builds are joined with semicolons:

```
/?builds=rapier.rapid.burst.low1.8.hyper2.4;pistol.sharp.fury.low2.10.hyper1.2
```

Page mount → read params → seed state. Any state change → replace URL params (shallow, no navigation). "Copy link" copies the current URL.

This gives shareable build links and back-button history without localStorage, accounts, or a backend.

## File layout

```
app/
  page.tsx
  components/
    BuildRow.tsx
    BuildList.tsx
  lib/
    calc/a-gear.ts
    url.ts
data/
  types.ts
  gears/a-gear.ts
public/
  images/weapons/*.webp
tests/
  calc.test.ts
  url.test.ts
```

## Testing strategy

**Unit (Vitest)** — the calculator is a pure function, so tests are cheap and comprehensive:
- Spec example matches expected BPS
- Invalid combos (modifier sum ≤ −1) return sentinel, not NaN/Infinity
- URL encode → decode round-trip preserves state
- Quantity clamping behaves correctly

**UI smoke (Playwright)** — one test: load page, add a row, pick selections, assert BPS number appears. Guards against regressions when gears are added.

## Deployment

- Host on **Vercel**, native Next.js integration
- `main` → production
- Every PR → preview URL
- No env vars, no backend, no secrets

## Rollout phases

Each phase is small and independently shippable:

| # | Scope | Done when |
|---|---|---|
| 1 | Scaffold: Next.js + TS + Tailwind + Vitest | `pnpm dev` serves empty page |
| 2 | Data types + empty A-Gear data file | Types compile |
| 3 | Calculator function + unit tests | Tests green against sample case |
| 4 | Single-row UI, no URL sync | Changing a dropdown updates BPS |
| 5 | Multi-row: add / remove / default row | Rows compute independently |
| 6 | URL sync + Copy link | Pasting URL restores state |
| 7 | Weapon image slot (placeholder) | Reserved box renders per row |
| 8 | Polish: mobile layout, invalid-state UI, favicon | Ready to ship |
| Later | Real weapon-base data, real card values, real images | Numbers match in-game |
| Future | B / I / M gears | Add `calc/*-gear.ts` + data file |

## Open items

- Actual `base` values for each A-Gear weapon — to be supplied.
- Actual values and `maxQty` for each low card and hyper card — to be supplied.
- Real weapon images — to be supplied.
- Confirmation whether low-card and hyper-card slots can be used simultaneously on one weapon.
