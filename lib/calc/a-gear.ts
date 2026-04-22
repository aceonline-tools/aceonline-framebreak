// lib/calc/a-gear.ts
import type { Build, GearData } from "@/data/types";

export function calculateBulletsPerSecondForAGear(
  build: Build,
  gearData: GearData,
  lowQuantity: number,
  hyperQuantity: number,
): number {
  const selectedPrefix = gearData.prefixes.find(p => p.id === build.prefixId);
  const selectedSuffix = gearData.suffixes.find(s => s.id === build.suffixId);
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

  const totalModifier =
    selectedPrefix.value + selectedSuffix.value + enchantModifier;

  const divisor = build.base * (1 + totalModifier);
  if (divisor <= 0) return NaN;

  return 3 / divisor;
}
