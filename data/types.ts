// data/types.ts

export type Affix = {
  id: string;
  name: string;
  value: number; // signed decimal; -0.15 means -15%
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
  lowCardId: string;
  lowQuantity: number;
  hyperCardId: string;
  hyperQuantity: number;
};

export type GearData = {
  id: "a" | "b" | "i" | "m";
  name: string;
  prefixes: Affix[];
  suffixes: Affix[];
  lowCards: EnchantCard[];
  hyperCards: EnchantCard[];
  calculateBulletsPerSecond: (build: Build, data: GearData) => number;
};
