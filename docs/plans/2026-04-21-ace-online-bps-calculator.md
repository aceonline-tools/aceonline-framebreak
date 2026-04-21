# Ace Online BPS Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static Next.js website that calculates bullets-per-second for Ace Online A-Gear weapons, supports multi-build comparison, and encodes state in a shareable URL.

**Architecture:** Single Next.js App Router page. Pure calculation function separated from React. Static TypeScript data files per gear so new gears plug in without touching the core. State lives in query params; no backend, no database, no auth.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Vitest + React Testing Library, deployed on Vercel.

**Reference design:** `docs/plans/2026-04-21-ace-online-bps-calculator-design.md`.

**Package manager:** `npm` throughout (universal, no extra install).

**Commit convention:** Short lowercase subject. Do NOT add co-author trailers. Avoid the words `medi`, `de`, or `verbund` in commit messages.

**Descriptive names:** Every variable, function, prop, and test name must read like English. No one-letter or abbreviation names except `id`.

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: everything under the worktree root via `create-next-app`

**Step 1: Run the scaffolder**

Run from the worktree root (`.worktrees/bps-calculator`):
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir=false \
  --import-alias="@/*" \
  --no-turbopack \
  --use-npm \
  --yes
```
Expected: project generated in current directory. If it refuses because the directory is non-empty, move `docs/` temporarily with `mv docs /tmp/docs-bps && <command> && mv /tmp/docs-bps/* docs/ 2>/dev/null; mv /tmp/docs-bps docs` — or pass `--force` if the installed version supports it.

**Step 2: Verify dev server boots**

```bash
npm run dev
```
Expected: server starts on `http://localhost:3000`. Stop it with Ctrl+C.

**Step 3: Commit**

```bash
git add -A
git commit -m "scaffold next.js app with typescript and tailwind"
```

---

## Task 2: Add Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json` — add `test` and `test:watch` scripts
- Modify: `tsconfig.json` — add `"vitest/globals"` to `types`

**Step 1: Install dev dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

**Step 3: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 4: Add npm scripts** — inside `package.json`'s `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Update `tsconfig.json` compilerOptions.types**

Add `"vitest/globals"` to the `types` array (create the array if missing):
```json
"types": ["vitest/globals"]
```

**Step 6: Write a smoke test**

Create `tests/smoke.test.ts`:
```ts
test("vitest is wired up", () => {
  expect(1 + 1).toBe(2);
});
```

**Step 7: Run it**

```bash
npm test
```
Expected: 1 test passed.

**Step 8: Commit**

```bash
git add -A
git commit -m "add vitest and react testing library"
```

---

## Task 3: Define shared data types

**Files:**
- Create: `data/types.ts`

**Step 1: Write types**

```ts
// data/types.ts

export type Weapon = {
  id: string;
  name: string;
  base: number;
};

export type Affix = {
  id: string;
  name: string;
  value: number; // signed decimal; -0.15 means -15%
};

export type EnchantCard = {
  id: string;
  name: string;
  value: number; // signed decimal per card
  maxQuantity: number;
};

export type Build = {
  weaponId: string;
  prefixId: string;
  suffixId: string;
  lowCardId: string;
  lowQuantity: number;
  hyperCardId: string;
  hyperQuantity: number;
};

export type GearData = {
  id: "a" | "b" | "i" | "m";
  name: string;
  weapons: Weapon[];
  prefixes: Affix[];
  suffixes: Affix[];
  lowCards: EnchantCard[];
  hyperCards: EnchantCard[];
  calculateBulletsPerSecond: (build: Build, data: GearData) => number;
};
```

**Step 2: Verify types compile**

```bash
npx tsc --noEmit
```
Expected: no output, exit 0.

**Step 3: Commit**

```bash
git add data/types.ts
git commit -m "define shared data types for weapons, affixes, enchant cards, and builds"
```

---

## Task 4: Write failing test for A-Gear BPS formula

**Files:**
- Create: `tests/calc/a-gear.test.ts`

**Step 1: Write the test**

```ts
// tests/calc/a-gear.test.ts
import { describe, expect, test } from "vitest";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";
import type { GearData } from "@/data/types";

const sampleGearData: GearData = {
  id: "a",
  name: "A-Gear",
  weapons:    [{ id: "rapier",     name: "Rapier",     base: 1.5 }],
  prefixes:   [{ id: "rapid",      name: "Rapid",      value: -0.10 }],
  suffixes:   [{ id: "burst",      name: "Burst",      value: -0.15 }],
  lowCards:   [{ id: "low-card",   name: "Low Card",   value: -0.02, maxQuantity: 10 }],
  hyperCards: [{ id: "hyper-card", name: "Hyper Card", value: -0.05, maxQuantity: 7 }],
  calculateBulletsPerSecond: (build, data) => calculateBulletsPerSecondForAGear(build, data),
};

describe("calculateBulletsPerSecondForAGear", () => {
  test("applies the A-Gear formula: 3 / (base * (1 + prefix + suffix + enchant))", () => {
    const build = {
      weaponId: "rapier",
      prefixId: "rapid",
      suffixId: "burst",
      lowCardId: "low-card",
      lowQuantity: 0,
      hyperCardId: "hyper-card",
      hyperQuantity: 0,
    };

    // 3 / (1.5 * (1 - 0.10 - 0.15)) = 3 / (1.5 * 0.75) = 3 / 1.125 = 2.666...
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(build, sampleGearData);
    expect(bulletsPerSecond).toBeCloseTo(2.6667, 3);
  });

  test("includes enchant cards multiplied by their quantity", () => {
    const build = {
      weaponId: "rapier",
      prefixId: "rapid",
      suffixId: "burst",
      lowCardId: "low-card",
      lowQuantity: 10,   // -0.02 * 10 = -0.20
      hyperCardId: "hyper-card",
      hyperQuantity: 0,
    };

    // modifier sum = -0.10 - 0.15 - 0.20 = -0.45
    // 3 / (1.5 * 0.55) = 3 / 0.825 ~= 3.6364
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(build, sampleGearData);
    expect(bulletsPerSecond).toBeCloseTo(3.6364, 3);
  });

  test("returns NaN when modifier sum reaches or passes -1 (invalid combo)", () => {
    const oversaturatedBuild = {
      weaponId: "rapier",
      prefixId: "rapid",
      suffixId: "burst",
      lowCardId: "low-card",
      lowQuantity: 10,   // -0.20
      hyperCardId: "hyper-card",
      hyperQuantity: 7,  // -0.35   => total -0.80
      // prefix + suffix = -0.25; total = -1.05 => invalid
    };
    // Actually -0.10 - 0.15 - 0.20 - 0.35 = -0.80 (still valid). Make it invalid:
    const invalidGearData: GearData = {
      ...sampleGearData,
      hyperCards: [{ id: "hyper-card", name: "Hyper Card", value: -0.15, maxQuantity: 7 }],
    };
    // -0.10 - 0.15 - 0.20 - (0.15 * 7) = -0.45 - 1.05 = -1.50
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(oversaturatedBuild, invalidGearData);
    expect(Number.isNaN(bulletsPerSecond)).toBe(true);
  });
});
```

**Step 2: Run it and verify it fails**

```bash
npm test
```
Expected: test FAILS with "Cannot find module '@/lib/calc/a-gear'" or equivalent.

**Step 3: Commit**

```bash
git add tests/calc/a-gear.test.ts
git commit -m "add failing tests for a-gear bps formula"
```

---

## Task 5: Implement A-Gear calculator

**Files:**
- Create: `lib/calc/a-gear.ts`

**Step 1: Write the implementation**

```ts
// lib/calc/a-gear.ts
import type { Build, GearData } from "@/data/types";

export function calculateBulletsPerSecondForAGear(
  build: Build,
  gearData: GearData,
): number {
  const selectedWeapon     = gearData.weapons.find(w => w.id === build.weaponId);
  const selectedPrefix     = gearData.prefixes.find(p => p.id === build.prefixId);
  const selectedSuffix     = gearData.suffixes.find(s => s.id === build.suffixId);
  const selectedLowCard    = gearData.lowCards.find(c => c.id === build.lowCardId);
  const selectedHyperCard  = gearData.hyperCards.find(c => c.id === build.hyperCardId);

  if (!selectedWeapon || !selectedPrefix || !selectedSuffix || !selectedLowCard || !selectedHyperCard) {
    return NaN;
  }

  const enchantModifier =
    selectedLowCard.value   * build.lowQuantity +
    selectedHyperCard.value * build.hyperQuantity;

  const totalModifier =
    selectedPrefix.value + selectedSuffix.value + enchantModifier;

  const divisor = selectedWeapon.base * (1 + totalModifier);
  if (divisor <= 0) return NaN;

  return 3 / divisor;
}
```

**Step 2: Run tests to verify they pass**

```bash
npm test
```
Expected: all 3 calc tests pass.

**Step 3: Commit**

```bash
git add lib/calc/a-gear.ts
git commit -m "implement a-gear bullets-per-second formula"
```

---

## Task 6: Create A-Gear data file with placeholder entries

**Files:**
- Create: `data/gears/a-gear.ts`

**Note:** Real weapon `base` values and card values will be supplied by the project owner later. Use small placeholder entries that match the formula so the UI has something to render.

**Step 1: Write the file**

```ts
// data/gears/a-gear.ts
import type { GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  weapons: [
    { id: "placeholder-weapon-1", name: "Placeholder Weapon 1", base: 1.5 },
    { id: "placeholder-weapon-2", name: "Placeholder Weapon 2", base: 2.0 },
  ],
  prefixes: [
    { id: "none",  name: "(none)",     value: 0 },
    { id: "rapid", name: "Rapid -10%", value: -0.10 },
  ],
  suffixes: [
    { id: "none",  name: "(none)",     value: 0 },
    { id: "burst", name: "Burst -15%", value: -0.15 },
  ],
  lowCards: [
    { id: "none",     name: "(none)",        value: 0,     maxQuantity: 0 },
    { id: "low-card", name: "Low Card -2%",  value: -0.02, maxQuantity: 10 },
  ],
  hyperCards: [
    { id: "none",       name: "(none)",           value: 0,     maxQuantity: 0 },
    { id: "hyper-card", name: "Hyper Card -5%",   value: -0.05, maxQuantity: 7 },
  ],
  calculateBulletsPerSecond: (build, data) => calculateBulletsPerSecondForAGear(build, data),
};

export const defaultAGearBuild = {
  weaponId:      aGearData.weapons[0].id,
  prefixId:      aGearData.prefixes[0].id,
  suffixId:      aGearData.suffixes[0].id,
  lowCardId:     aGearData.lowCards[0].id,
  lowQuantity:   0,
  hyperCardId:   aGearData.hyperCards[0].id,
  hyperQuantity: 0,
};
```

**Step 2: Verify types**

```bash
npx tsc --noEmit
```
Expected: clean.

**Step 3: Commit**

```bash
git add data/gears/a-gear.ts
git commit -m "add placeholder a-gear data"
```

---

## Task 7: Write failing test for BuildRow renders and reacts to changes

**Files:**
- Create: `tests/components/BuildRow.test.tsx`

**Step 1: Write the test**

```tsx
// tests/components/BuildRow.test.tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildRow } from "@/app/components/BuildRow";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("BuildRow", () => {
  test("renders dropdowns for weapon, prefix, suffix, low card, hyper card", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    expect(screen.getByLabelText(/weapon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suffix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/low card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hyper card/i)).toBeInTheDocument();
  });

  test("displays a bullets-per-second number computed from the build", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    // default build has all zero modifiers; base = 1.5 → 3 / 1.5 = 2.00
    expect(screen.getByTestId("bullets-per-second")).toHaveTextContent("2.00");
  });

  test("calls onChange when the user picks a new prefix", async () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    await userEvent.selectOptions(screen.getByLabelText(/prefix/i), "rapid");
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ prefixId: "rapid" }));
  });

  test("calls onRemove when the delete button is clicked", async () => {
    const handleRemove = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={handleRemove} />
    );

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(handleRemove).toHaveBeenCalled();
  });
});
```

**Step 2: Run it, verify it fails**

```bash
npm test
```
Expected: test FAILS with "Cannot find module '@/app/components/BuildRow'".

**Step 3: Commit**

```bash
git add tests/components/BuildRow.test.tsx
git commit -m "add failing tests for build row component"
```

---

## Task 8: Implement BuildRow component

**Files:**
- Create: `app/components/BuildRow.tsx`

**Step 1: Write the component**

```tsx
// app/components/BuildRow.tsx
"use client";

import type { Build, GearData } from "@/data/types";

type BuildRowProps = {
  build: Build;
  gearData: GearData;
  onChange: (updatedBuild: Build) => void;
  onRemove: () => void;
};

export function BuildRow({ build, gearData, onChange, onRemove }: BuildRowProps) {
  const bulletsPerSecond = gearData.calculateBulletsPerSecond(build, gearData);
  const formattedBullets = Number.isFinite(bulletsPerSecond) ? bulletsPerSecond.toFixed(2) : "—";

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
  };

  const selectedLowCard = gearData.lowCards.find(c => c.id === build.lowCardId);
  const selectedHyperCard = gearData.hyperCards.find(c => c.id === build.hyperCardId);

  return (
    <div className="flex items-stretch gap-4 rounded-lg border border-neutral-200 p-4">
      <div className="flex w-60 flex-col gap-2">
        <LabeledSelect label="Weapon" value={build.weaponId} onChange={v => updateField("weaponId", v)}>
          {gearData.weapons.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Prefix" value={build.prefixId} onChange={v => updateField("prefixId", v)}>
          {gearData.prefixes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Suffix" value={build.suffixId} onChange={v => updateField("suffixId", v)}>
          {gearData.suffixes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Low card" value={build.lowCardId} onChange={v => updateField("lowCardId", v)}>
          {gearData.lowCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
        <LabeledNumber
          label="Low qty"
          value={build.lowQuantity}
          max={selectedLowCard?.maxQuantity ?? 0}
          onChange={v => updateField("lowQuantity", v)}
        />
        <LabeledSelect label="Hyper card" value={build.hyperCardId} onChange={v => updateField("hyperCardId", v)}>
          {gearData.hyperCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
        <LabeledNumber
          label="Hyper qty"
          value={build.hyperQuantity}
          max={selectedHyperCard?.maxQuantity ?? 0}
          onChange={v => updateField("hyperQuantity", v)}
        />
      </div>

      <div className="flex w-40 items-center justify-center rounded border border-dashed border-neutral-300 text-sm text-neutral-400">
        image
      </div>

      <div className="flex flex-1 items-center justify-center">
        <span data-testid="bullets-per-second" className="text-4xl font-semibold tabular-nums">
          {formattedBullets}
        </span>
        <span className="ml-2 text-sm text-neutral-500">b/s</span>
      </div>

      <button
        type="button"
        aria-label="Remove build"
        onClick={onRemove}
        className="self-start rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100"
      >
        ✕
      </button>
    </div>
  );
}

type LabeledSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function LabeledSelect({ label, value, onChange, children }: LabeledSelectProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="w-20 text-neutral-600">{label}</span>
      <select
        className="flex-1 rounded border border-neutral-300 px-2 py-1"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

type LabeledNumberProps = {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

function LabeledNumber({ label, value, max, onChange }: LabeledNumberProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="w-20 text-neutral-600">{label}</span>
      <input
        type="number"
        className="w-20 rounded border border-neutral-300 px-2 py-1"
        min={0}
        max={max}
        value={value}
        onChange={event => {
          const parsed = Number(event.target.value);
          const clamped = Math.max(0, Math.min(max, Number.isFinite(parsed) ? parsed : 0));
          onChange(clamped);
        }}
      />
    </label>
  );
}
```

**Step 2: Run tests**

```bash
npm test
```
Expected: BuildRow tests pass.

**Step 3: Commit**

```bash
git add app/components/BuildRow.tsx
git commit -m "implement build row component with dropdowns image slot and bps output"
```

---

## Task 9: Write failing test for BuildList (add/remove rows)

**Files:**
- Create: `tests/components/BuildList.test.tsx`

**Step 1: Write the test**

```tsx
// tests/components/BuildList.test.tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildList } from "@/app/components/BuildList";

describe("BuildList", () => {
  test("starts with one build row", () => {
    render(<BuildList />);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("appends a new build row when Add build is clicked", async () => {
    render(<BuildList />);
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(2);
  });

  test("removes a build row when its remove button is clicked", async () => {
    render(<BuildList />);
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("does not remove the last remaining row", async () => {
    render(<BuildList />);
    const removeButton = screen.getByRole("button", { name: /remove/i });
    await userEvent.click(removeButton);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });
});
```

**Step 2: Run and verify fails**

```bash
npm test
```
Expected: FAIL on missing module.

**Step 3: Commit**

```bash
git add tests/components/BuildList.test.tsx
git commit -m "add failing tests for build list"
```

---

## Task 10: Implement BuildList component

**Files:**
- Create: `app/components/BuildList.tsx`

**Step 1: Write the component**

```tsx
// app/components/BuildList.tsx
"use client";

import { useState } from "react";
import type { Build } from "@/data/types";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";
import { BuildRow } from "./BuildRow";

export function BuildList() {
  const [builds, setBuilds] = useState<Build[]>([defaultAGearBuild]);

  const updateBuildAt = (indexToUpdate: number, updatedBuild: Build) => {
    setBuilds(previousBuilds =>
      previousBuilds.map((build, index) => (index === indexToUpdate ? updatedBuild : build))
    );
  };

  const appendBuild = () => {
    setBuilds(previousBuilds => [...previousBuilds, defaultAGearBuild]);
  };

  const removeBuildAt = (indexToRemove: number) => {
    setBuilds(previousBuilds =>
      previousBuilds.length <= 1
        ? previousBuilds
        : previousBuilds.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {builds.map((build, index) => (
        <BuildRow
          key={index}
          build={build}
          gearData={aGearData}
          onChange={updatedBuild => updateBuildAt(index, updatedBuild)}
          onRemove={() => removeBuildAt(index)}
        />
      ))}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={appendBuild}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          + Add build
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Run tests**

```bash
npm test
```
Expected: BuildList tests pass.

**Step 3: Commit**

```bash
git add app/components/BuildList.tsx
git commit -m "implement build list with add and remove row actions"
```

---

## Task 11: Wire BuildList into the home page

**Files:**
- Modify: `app/page.tsx` — replace boilerplate

**Step 1: Replace file contents**

```tsx
// app/page.tsx
import { BuildList } from "@/app/components/BuildList";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Ace Online BPS Calculator</h1>
      <BuildList />
    </main>
  );
}
```

**Step 2: Boot the dev server and eyeball it**

```bash
npm run dev
```
Open `http://localhost:3000`. Expected:
- One build row renders with all dropdowns
- BPS number shows `2.00` for the default build
- Changing any dropdown updates the number
- "+ Add build" adds another row
- "✕" removes a non-last row

Stop the dev server with Ctrl+C.

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "render build list on home page"
```

---

## Task 12: Write failing tests for URL encode/decode

**Files:**
- Create: `tests/lib/url.test.ts`

**Step 1: Write the tests**

```ts
// tests/lib/url.test.ts
import { describe, expect, test } from "vitest";
import { encodeBuildsToQuery, decodeBuildsFromQuery } from "@/lib/url";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("url encoding", () => {
  test("encodes a single build as dot-separated fields", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild]);
    const expectedBuild = defaultAGearBuild;
    const expected = [
      expectedBuild.weaponId,
      expectedBuild.prefixId,
      expectedBuild.suffixId,
      expectedBuild.lowCardId,
      expectedBuild.lowQuantity,
      expectedBuild.hyperCardId,
      expectedBuild.hyperQuantity,
    ].join(".");
    expect(encoded).toBe(expected);
  });

  test("joins multiple builds with semicolons", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild, defaultAGearBuild]);
    expect(encoded.split(";")).toHaveLength(2);
  });

  test("round-trips builds through encode then decode", () => {
    const original = [defaultAGearBuild, { ...defaultAGearBuild, lowQuantity: 4, hyperQuantity: 2 }];
    const encoded = encodeBuildsToQuery(original);
    const decoded = decodeBuildsFromQuery(encoded, aGearData);
    expect(decoded).toEqual(original);
  });

  test("falls back to the default build when the query is empty", () => {
    const decoded = decodeBuildsFromQuery("", aGearData);
    expect(decoded).toEqual([defaultAGearBuild]);
  });

  test("falls back to defaults when a build field references an unknown id", () => {
    const decoded = decodeBuildsFromQuery("missing-weapon.none.none.none.0.none.0", aGearData);
    expect(decoded[0].weaponId).toBe(defaultAGearBuild.weaponId);
  });
});
```

**Step 2: Run, verify fail**

```bash
npm test
```
Expected: FAIL on missing module.

**Step 3: Commit**

```bash
git add tests/lib/url.test.ts
git commit -m "add failing tests for url encode and decode"
```

---

## Task 13: Implement URL encode/decode

**Files:**
- Create: `lib/url.ts`

**Step 1: Write the implementation**

```ts
// lib/url.ts
import type { Build, GearData } from "@/data/types";

const FIELD_SEPARATOR = ".";
const BUILD_SEPARATOR = ";";

export function encodeBuildsToQuery(builds: Build[]): string {
  return builds
    .map(build =>
      [
        build.weaponId,
        build.prefixId,
        build.suffixId,
        build.lowCardId,
        String(build.lowQuantity),
        build.hyperCardId,
        String(build.hyperQuantity),
      ].join(FIELD_SEPARATOR)
    )
    .join(BUILD_SEPARATOR);
}

export function decodeBuildsFromQuery(queryValue: string, gearData: GearData): Build[] {
  const defaultBuild: Build = {
    weaponId:      gearData.weapons[0].id,
    prefixId:      gearData.prefixes[0].id,
    suffixId:      gearData.suffixes[0].id,
    lowCardId:     gearData.lowCards[0].id,
    lowQuantity:   0,
    hyperCardId:   gearData.hyperCards[0].id,
    hyperQuantity: 0,
  };

  if (!queryValue) return [defaultBuild];

  const parsedBuilds = queryValue
    .split(BUILD_SEPARATOR)
    .map(rawBuild => {
      const [
        weaponId,
        prefixId,
        suffixId,
        lowCardId,
        lowQuantityString,
        hyperCardId,
        hyperQuantityString,
      ] = rawBuild.split(FIELD_SEPARATOR);

      const resolve = <T extends { id: string }>(items: T[], candidateId: string | undefined, fallback: string): string =>
        items.some(item => item.id === candidateId) ? candidateId! : fallback;

      const parsedLowQuantity = Number(lowQuantityString);
      const parsedHyperQuantity = Number(hyperQuantityString);

      return {
        weaponId:      resolve(gearData.weapons,    weaponId,    defaultBuild.weaponId),
        prefixId:      resolve(gearData.prefixes,   prefixId,    defaultBuild.prefixId),
        suffixId:      resolve(gearData.suffixes,   suffixId,    defaultBuild.suffixId),
        lowCardId:     resolve(gearData.lowCards,   lowCardId,   defaultBuild.lowCardId),
        lowQuantity:   Number.isFinite(parsedLowQuantity) ? parsedLowQuantity : 0,
        hyperCardId:   resolve(gearData.hyperCards, hyperCardId, defaultBuild.hyperCardId),
        hyperQuantity: Number.isFinite(parsedHyperQuantity) ? parsedHyperQuantity : 0,
      } satisfies Build;
    });

  return parsedBuilds.length > 0 ? parsedBuilds : [defaultBuild];
}
```

**Step 2: Run tests**

```bash
npm test
```
Expected: url tests pass.

**Step 3: Commit**

```bash
git add lib/url.ts
git commit -m "implement url encode and decode for builds"
```

---

## Task 14: Sync BuildList state with URL query params

**Files:**
- Modify: `app/components/BuildList.tsx`

**Step 1: Replace file contents**

```tsx
// app/components/BuildList.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Build } from "@/data/types";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";
import { encodeBuildsToQuery, decodeBuildsFromQuery } from "@/lib/url";
import { BuildRow } from "./BuildRow";

const QUERY_KEY = "builds";

export function BuildList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [builds, setBuilds] = useState<Build[]>(() =>
    decodeBuildsFromQuery(searchParams.get(QUERY_KEY) ?? "", aGearData)
  );

  useEffect(() => {
    const encoded = encodeBuildsToQuery(builds);
    const currentSearch = window.location.search;
    const nextSearch = `?${QUERY_KEY}=${encoded}`;
    if (currentSearch !== nextSearch) {
      router.replace(nextSearch, { scroll: false });
    }
  }, [builds, router]);

  const updateBuildAt = (indexToUpdate: number, updatedBuild: Build) => {
    setBuilds(previousBuilds =>
      previousBuilds.map((build, index) => (index === indexToUpdate ? updatedBuild : build))
    );
  };

  const appendBuild = () => {
    setBuilds(previousBuilds => [...previousBuilds, defaultAGearBuild]);
  };

  const removeBuildAt = (indexToRemove: number) => {
    setBuilds(previousBuilds =>
      previousBuilds.length <= 1
        ? previousBuilds
        : previousBuilds.filter((_, index) => index !== indexToRemove)
    );
  };

  const copyShareableLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex flex-col gap-4">
      {builds.map((build, index) => (
        <BuildRow
          key={index}
          build={build}
          gearData={aGearData}
          onChange={updatedBuild => updateBuildAt(index, updatedBuild)}
          onRemove={() => removeBuildAt(index)}
        />
      ))}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={appendBuild}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          + Add build
        </button>
        <button
          type="button"
          onClick={copyShareableLink}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Update BuildList test to wrap in Suspense if needed**

`useSearchParams` in the App Router requires a Suspense boundary. If the existing tests now fail with a related error, wrap `<BuildList />` rendering in tests with `<Suspense fallback={null}>` imported from React, or add `"force-dynamic"` export. Prefer the Suspense wrapper in the test file.

Adjust `tests/components/BuildList.test.tsx` imports and renders:
```tsx
import { Suspense } from "react";
// ...
render(<Suspense fallback={null}><BuildList /></Suspense>);
```
Apply the same wrapper in each `render(...)` call. Tests should keep passing.

**Step 3: Run tests**

```bash
npm test
```
Expected: all green.

**Step 4: Manual check**

```bash
npm run dev
```
Open the page, change dropdowns, confirm the URL's `?builds=...` updates. Copy link → paste in a new tab → state restored. Stop server.

**Step 5: Commit**

```bash
git add app/components/BuildList.tsx tests/components/BuildList.test.tsx
git commit -m "sync build list state with url query params and add copy link"
```

---

## Task 15: Mobile-responsive layout polish

**Files:**
- Modify: `app/components/BuildRow.tsx`

**Step 1: Update the root row container and columns**

Replace the outer `<div className="flex items-stretch gap-4 ...">` with:
```tsx
<div className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-stretch">
```

Change the image column to hide on narrow screens:
```tsx
<div className="hidden w-40 items-center justify-center rounded border border-dashed border-neutral-300 text-sm text-neutral-400 sm:flex">
  image
</div>
```

Make the result column always visible but stack below on mobile:
```tsx
<div className="flex flex-1 items-center justify-center gap-2 sm:flex-col sm:justify-center">
  <span data-testid="bullets-per-second" className="text-4xl font-semibold tabular-nums">{formattedBullets}</span>
  <span className="text-sm text-neutral-500">b/s</span>
</div>
```

**Step 2: Manual check**

```bash
npm run dev
```
Open `http://localhost:3000`. Resize browser to < 640px wide. Expected: controls stack vertically, image hides, BPS stays visible.

**Step 3: Run tests**

```bash
npm test
```
Expected: all green.

**Step 4: Commit**

```bash
git add app/components/BuildRow.tsx
git commit -m "make build row responsive for small screens"
```

---

## Task 16: Page metadata and title

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update the exported metadata object**

```tsx
export const metadata = {
  title: "Ace Online BPS Calculator",
  description: "Calculate bullets per second for Ace Online weapons across different prefix, suffix, and enchant setups.",
};
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "set page title and description"
```

---

## Task 17: Final verification

**Step 1: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 2: Run all tests**

```bash
npm test
```
Expected: all green.

**Step 3: Production build**

```bash
npm run build
```
Expected: build succeeds with no errors or warnings beyond informational output.

**Step 4: Smoke-run production server**

```bash
npm start
```
Open `http://localhost:3000`, exercise the UI end-to-end (add row, change values, copy link, paste in new tab). Stop server.

**Step 5: No commit needed** — this task only verifies the work above.

---

## After all tasks complete

- The worktree should have a clean `git status` (all work committed).
- Use `superpowers:finishing-a-development-branch` to decide how to merge into `main` (direct merge, PR, etc.).
- Real weapon `base` values, real card values, and real images go into a follow-up task once the project owner supplies them.

## Future gears (B / I / M)

When new gears are added:
1. Create `lib/calc/<gear>.ts` with that gear's formula.
2. Create `data/gears/<gear>.ts` exporting `GearData` + default build.
3. Add a gear selector UI (global toggle or route per gear) and let `BuildList` receive the selected `GearData` as a prop.

The existing core (`BuildRow`, `BuildList`, URL encoder, types) should not need changes.
