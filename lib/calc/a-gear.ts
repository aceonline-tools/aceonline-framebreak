// lib/calc/a-gear.ts
import type { Build, GearData } from "@/data/types";

export function calculateBulletsPerSecondForAGear(
  build: Build,
  gearData: GearData,
): number {
  const selectedPrefix    = gearData.prefixes.find(p => p.id === build.prefixId);
  const selectedSuffix    = gearData.suffixes.find(s => s.id === build.suffixId);
  const selectedLowCard   = gearData.lowCards.find(c => c.id === build.lowCardId);
  const selectedHyperCard = gearData.hyperCards.find(c => c.id === build.hyperCardId);

  if (!selectedPrefix || !selectedSuffix || !selectedLowCard || !selectedHyperCard) {
    return NaN;
  }
  if (!Number.isFinite(build.base) || build.base <= 0) {
    return NaN;
  }

  const enchantModifier =
    selectedLowCard.value   * build.lowQuantity +
    selectedHyperCard.value * build.hyperQuantity;

  const totalModifier =
    selectedPrefix.value + selectedSuffix.value + enchantModifier;

  const divisor = build.base * (1 + totalModifier);
  if (divisor <= 0) return NaN;

  return 3 / divisor;
}
