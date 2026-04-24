// data/types.ts

export type Affix = {
  id: string;
  name: string;
  // Stat modifiers keyed by stat id. The `tck` key is the TCK modifier
  // (-0.15 means -15%); other keys are per-enchant bonuses (cx, xp, damage…).
  values: Partial<Record<string, number>>;
};

export type EnchantCard = {
  id: string;
  name: string;
  value: number; // signed decimal per card
  maxQuantity: number;
};

export type Weapon = {
  id: string;
  name: string;
  // Stat values keyed by stat id. `tck` is the base TCK rate (e.g. 0.45),
  // other keys are baseline stat contributions as decimals (0.9 = +90%).
  values: Partial<Record<string, number>>;
};

export type SelectedCell = {
  lowQuantity: number;
  hyperQuantity: number;
};

export type Build = {
  base: number;
  prefixId: string;
  suffixId: string;
  selectedCells?: SelectedCell[];
  otherEnchantId?: string;
};

export type GearData = {
  id: "a" | "b" | "i" | "m";
  name: string;
  weapons: Weapon[];
  prefixes: Affix[];
  suffixes: Affix[];
  lowCards: EnchantCard[];
  hyperCards: EnchantCard[];
  calculateBulletsPerSecond: (
    build: Build,
    data: GearData,
    lowQuantity: number,
    hyperQuantity: number,
  ) => number;
};
