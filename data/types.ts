// data/types.ts

export type Affix = {
  id: string;
  name: string;
  value: number; // signed decimal TCK modifier; -0.15 means -15%
  bonuses?: Partial<Record<string, number>>; // extra per-enchant-type bonuses, keyed by enchant id
};

export type EnchantCard = {
  id: string;
  name: string;
  value: number; // signed decimal per card
  maxQuantity: number;
};

export type Build = {
  base: number;
  prefixId: string;
  suffixId: string;
};

export type GearData = {
  id: "a" | "b" | "i" | "m";
  name: string;
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
