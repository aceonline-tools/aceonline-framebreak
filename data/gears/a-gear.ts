// data/gears/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { calculateBulletsPerSecondForAGear } from "@/lib/calc/a-gear";

export const aGearData: GearData = {
  id: "a",
  name: "A-Gear",
  weapons: [
    { id: "bs",     name: "Big Smash", values: { tck: 0.45, xp: 0, cx: 0.9 } },
    { id: "rantee", name: "Rantee",    values: { tck: 0.3,  xp: 0, cx: 0.8 } },
  ],
  prefixes: [
    { id: "none",         name: "None",          values: {}                                  },
    { id: "bio",          name: "Bio",           values: { tck: -0.15, cx: 0.14 }            },
    { id: "attack",       name: "Attack",        values: { tck: -0.14, cx: 0.15 }            },
    { id: "squire",       name: "Squire",        values: { tck: -0.15, damage: 0.14 }        },
    { id: "major",        name: "Major",         values: { tck: -0.14, damage: 0.15 }        },
    { id: "attack-luck",  name: "Attack Luck",   values: { tck: -0.14, cx: 0.15, damage: 0.05 } },
    { id: "squire-luck",  name: "Squire Luck",   values: { tck: -0.15, cx: 0.05, damage: 0.14 } },
    { id: "major-luck",   name: "Major Luck",    values: { tck: -0.14, cx: 0.05, damage: 0.15 } },
    { id: "bandit",       name: "Bandit",        values: { tck: -0.05, xp: 0.15 }            },
  ],
  suffixes: [
    { id: "none",         name: "None",              values: {}                                  },
    { id: "bio",          name: "Of Bio",            values: { tck: -0.15, cx: 0.14 }            },
    { id: "attack",       name: "Of Attack",         values: { tck: -0.14, cx: 0.15 }            },
    { id: "squire",       name: "Of Squire",         values: { tck: -0.15, damage: 0.14 }        },
    { id: "major",        name: "Of Major",          values: { tck: -0.14, damage: 0.15 }        },
    { id: "attack-luck",  name: "Of Attack Luck",    values: { tck: -0.14, cx: 0.15, damage: 0.05 } },
    { id: "squire-luck",  name: "Of Squire Luck",    values: { tck: -0.15, cx: 0.05, damage: 0.14 } },
    { id: "major-luck",   name: "Of Major Luck",     values: { tck: -0.14, cx: 0.05, damage: 0.15 } },
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
};
