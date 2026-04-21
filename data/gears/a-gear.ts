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
