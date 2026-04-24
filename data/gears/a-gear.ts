// data/gears/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  weapons: [
    { id: "bs",     name: "Tamuz Big Smash", values: { tck: 0.45, xp: 0, cx: 0.9, damageMin: 147, damageMax: 191 }, color: "#ff3bf1" },
    { id: "rantee-1", name: "Rantee",    values: { tck: 0.3,  xp: 0, cx: 0.8, damageMin: 111, damageMax: 146 } },
    { id: "rantee-2", name: "Rantee",    values: { tck: 0.3,  xp: 0, cx: 0.8, damageMin: 114, damageMax: 149 }, color: "yellow" },
    { id: "rantee-3", name: "Rantee",    values: { tck: 0.3,  xp: 0, cx: 0.8, damageMin: 117, damageMax: 152 }, color: "var(--color-sky-600)" },
  ],
  lowCards: [
    { id: "low-card", name: "-2%", value: -0.02, maxQuantity: 10 },
  ],
  hyperCards: [
    { id: "hyper-card", name: "-3%", value: -0.03, maxQuantity: 6 },
  ],
  calculateBulletsPerSecond: (build, data, lowQuantity, hyperQuantity) =>
    calculateBulletsPerSecondForAGear(build, data, lowQuantity, hyperQuantity),
};

export const defaultAGearBuild: Build = {
  base:           0.45,
  prefixId:       "bio",
  suffixId:       "bio",
  selectedCells: [
    { lowQuantity: 10, hyperQuantity: 2 },
    { lowQuantity: 10, hyperQuantity: 6 },
  ],
  otherEnchantId: "cx",
  weaponId:       "bs",
};
