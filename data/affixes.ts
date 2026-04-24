// data/affixes.ts
import type { Affix } from "./types";

export const PREFIXES: Affix[] = [
  { id: "none",         name: "None",          values: {}                                  },
  { id: "bandit",       name: "Bandit",        values: { tck: -0.05, xp: 0.15 }            },
  { id: "bio",          name: "Bio",           values: { tck: -0.15, cx: 0.14 }            },
  { id: "squire",       name: "Squire",        values: { tck: -0.15, damage: 0.14 }        },
  { id: "attack",       name: "Attack",        values: { tck: -0.14, cx: 0.15 }            },
  { id: "attack-luck",  name: "Attack Luck",   values: { tck: -0.14, cx: 0.15, damage: 0.05 } },
  { id: "major",        name: "Major",         values: { tck: -0.14, damage: 0.15 }        },
  { id: "major-luck",   name: "Major Luck",    values: { tck: -0.14, cx: 0.05, damage: 0.15 } },
];

export const SUFFIXES: Affix[] = [
  { id: "none",         name: "None",              values: {}                                  },
  { id: "bio",          name: "Of Bio",            values: { tck: -0.15, cx: 0.14 }            },
  { id: "squire",       name: "Of Squire",         values: { tck: -0.15, damage: 0.14 }        },
  { id: "squire-luck",  name: "Of Squire Luck",    values: { tck: -0.15, cx: 0.05, damage: 0.14 } },
  { id: "attack",       name: "Of Attack",         values: { tck: -0.14, cx: 0.15 }            },
  { id: "attack-luck",  name: "Of Attack Luck",    values: { tck: -0.14, cx: 0.15, damage: 0.05 } },
  { id: "major",        name: "Of Major",          values: { tck: -0.14, damage: 0.15 }        },
  { id: "major-luck",   name: "Of Major Luck",     values: { tck: -0.14, cx: 0.05, damage: 0.15 } },
];
