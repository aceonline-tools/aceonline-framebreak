// data/gears/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  prefixes: [
    { id: "none",       name: "(none)",      value:  0    },
    { id: "prefix-13",  name: "Prefix -13%", value: -0.13 },
    { id: "prefix-14",  name: "Prefix -14%", value: -0.14 },
    { id: "prefix-15",  name: "Prefix -15%", value: -0.15 },
  ],
  suffixes: [
    { id: "none",       name: "(none)",      value:  0    },
    { id: "suffix-13",  name: "Suffix -13%", value: -0.13 },
    { id: "suffix-14",  name: "Suffix -14%", value: -0.14 },
    { id: "suffix-15",  name: "Suffix -15%", value: -0.15 },
  ],
  lowCards: [
    { id: "none",     name: "(none)",        value:  0,    maxQuantity:  0 },
    { id: "low-card", name: "Low Card -2%",  value: -0.02, maxQuantity: 10 },
  ],
  hyperCards: [
    { id: "none",       name: "(none)",         value:  0,    maxQuantity: 0 },
    { id: "hyper-card", name: "Hyper Card -3%", value: -0.03, maxQuantity: 7 },
  ],
  calculateBulletsPerSecond: (build, data, lowQuantity, hyperQuantity) =>
    calculateBulletsPerSecondForAGear(build, data, lowQuantity, hyperQuantity),
};

export const defaultAGearBuild: Build = {
  base:        1.5,
  prefixId:    aGearData.prefixes[0].id,
  suffixId:    aGearData.suffixes[0].id,
  lowCardId:   aGearData.lowCards[0].id,
  hyperCardId: aGearData.hyperCards[0].id,
};
