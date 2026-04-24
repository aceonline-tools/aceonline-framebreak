// tests/calc/a-gear.test.ts
import { describe, expect, test, vi } from "vitest";
import type { GearData } from "@/data/types";

vi.mock("@/data/affixes", () => ({
  PREFIXES: [{ id: "rapid", name: "Rapid", values: { tck: -0.10 } }],
  SUFFIXES: [{ id: "burst", name: "Burst", values: { tck: -0.15 } }],
}));

const { calculateBulletsPerSecondForAGear } = await import("@/lib/calc/a-gear");

const sampleGearData: GearData = {
  id: "a",
  name: "A-Gear",
  weapons:    [{ id: "bs",         name: "BS",         values: { tck: 1.5 } }],
  lowCards:   [{ id: "low-card",   name: "Low Card",   value: -0.02, maxQuantity: 10 }],
  hyperCards: [{ id: "hyper-card", name: "Hyper Card", value: -0.05, maxQuantity: 7 }],
  calculateBulletsPerSecond: (build, data, lowQuantity, hyperQuantity) =>
    calculateBulletsPerSecondForAGear(build, data, lowQuantity, hyperQuantity),
};

const buildWithAllSelections = {
  base: 1.5,
  prefixId: "rapid",
  suffixId: "burst",
};

describe("calculateBulletsPerSecondForAGear", () => {
  test("applies the A-Gear formula: 3 / (base * (1 + prefix + suffix + enchant))", () => {
    // 3 / (1.5 * (1 - 0.10 - 0.15)) = 3 / (1.5 * 0.75) = 3 / 1.125 = 2.666...
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(buildWithAllSelections, sampleGearData, 0, 0);
    expect(bulletsPerSecond).toBeCloseTo(2.6667, 3);
  });

  test("includes enchant cards multiplied by their quantity", () => {
    // modifier sum = -0.10 - 0.15 - 0.20 = -0.45
    // 3 / (1.5 * 0.55) = 3 / 0.825 ~= 3.6364
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(buildWithAllSelections, sampleGearData, 10, 0);
    expect(bulletsPerSecond).toBeCloseTo(3.6364, 3);
  });

  test("returns NaN when modifier sum reaches or passes -1 (invalid combo)", () => {
    const invalidGearData: GearData = {
      ...sampleGearData,
      hyperCards: [{ id: "hyper-card", name: "Hyper Card", value: -0.15, maxQuantity: 7 }],
    };
    // -0.10 - 0.15 - 0.20 - (0.15 * 7) = -0.45 - 1.05 = -1.50
    const bulletsPerSecond = calculateBulletsPerSecondForAGear(
      buildWithAllSelections,
      invalidGearData,
      10,
      7,
    );
    expect(Number.isNaN(bulletsPerSecond)).toBe(true);
  });

  test("returns NaN for non-positive base", () => {
    const buildWithZeroBase = { ...buildWithAllSelections, base: 0 };
    expect(
      Number.isNaN(calculateBulletsPerSecondForAGear(buildWithZeroBase, sampleGearData, 0, 0)),
    ).toBe(true);
  });
});
