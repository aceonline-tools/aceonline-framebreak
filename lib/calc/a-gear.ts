// lib/calc/a-gear.ts
import type { Build, GearData } from "@/data/types";
import { PREFIXES, SUFFIXES } from "@/data/affixes";

export function calculateBulletsPerSecondForAGear(
  build: Build,
  gearData: GearData,
  lowQuantity: number,
  hyperQuantity: number,
): number {
  const selectedPrefix = PREFIXES.find(p => p.id === build.prefixId);
  const selectedSuffix = SUFFIXES.find(s => s.id === build.suffixId);
  const activeLowCard = gearData.lowCards[0];
  const activeHyperCard = gearData.hyperCards[0];

  if (!selectedPrefix || !selectedSuffix || !activeLowCard || !activeHyperCard) {
    return NaN;
  }
  if (!Number.isFinite(build.base) || build.base <= 0) {
    return NaN;
  }

  const enchantModifier =
    activeLowCard.value   * lowQuantity +
    activeHyperCard.value * hyperQuantity;

  const prefixTckModifier = selectedPrefix.values.tck ?? 0;
  const suffixTckModifier = selectedSuffix.values.tck ?? 0;
  const totalModifier = prefixTckModifier + suffixTckModifier + enchantModifier;

  const divisor = build.base * (1 + totalModifier);
  if (divisor <= 0) return NaN;

  return 3 / divisor;
}
