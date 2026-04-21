// data/gears/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  prefixes: [
    { id: "none",      name: "0%",   value:  0    },
    { id: "prefix-13", name: "-13%", value: -0.13 },
    { id: "prefix-14", name: "-14%", value: -0.14 },
    { id: "prefix-15", name: "-15%", value: -0.15 },
  ],
  suffixes: [
    { id: "none",      name: "0%",   value:  0    },
    { id: "suffix-5",  name: "-5%",  value: -0.05 },
    { id: "suffix-13", name: "-13%", value: -0.13 },
    { id: "suffix-14", name: "-14%", value: -0.14 },
    { id: "suffix-15", name: "-15%", value: -0.15 },
  ],
  lowCards: [
    { id: "none",     name: "0%",  value:  0,    maxQuantity:  0 },
    { id: "low-card", name: "-2%", value: -0.02, maxQuantity: 10 },
  ],
  hyperCards: [
    { id: "none",       name: "0%",  value:  0,    maxQuantity: 0 },
    { id: "hyper-card", name: "-3%", value: -0.03, maxQuantity: 6 },
  ],
  calculateBulletsPerSecond: (build, data, lowQuantity, hyperQuantity) =>
    calculateBulletsPerSecondForAGear(build, data, lowQuantity, hyperQuantity),
};

export const defaultAGearBuild: Build = {
  base:        1.5,
  prefixId:    aGearData.prefixes[0].id,
  suffixId:    aGearData.suffixes[0].id,
  lowCardId:   "low-card",
  hyperCardId: "hyper-card",
};
