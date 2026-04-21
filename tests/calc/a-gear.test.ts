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
