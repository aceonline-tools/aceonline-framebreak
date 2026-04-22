// data/gears/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  prefixes: [
    { id: "none",      name: "0%",              value:  0    },
    { id: "prefix-5",  name: "-5% (+15% XP)",   value: -0.05, bonuses: { xp: 0.15 } },
    { id: "prefix-13", name: "-13%",            value: -0.13 },
    { id: "prefix-14", name: "-14%",            value: -0.14 },
    { id: "prefix-15", name: "-15%",            value: -0.15 },
  ],
  suffixes: [
    { id: "none",      name: "0%",   value:  0    },
    { id: "suffix-13", name: "-13%", value: -0.13 },
    { id: "suffix-14", name: "-14%", value: -0.14 },
    { id: "suffix-15", name: "-15%", value: -0.15 },
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
  prefixId:       "prefix-15",
  suffixId:       "suffix-15",
  selectedCells: [
    { lowQuantity: 10, hyperQuantity: 2 },
    { lowQuantity: 10, hyperQuantity: 6 },
  ],
  otherEnchantId: "xp",
};
