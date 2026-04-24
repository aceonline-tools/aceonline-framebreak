// app/components/shared.tsx
"use client";

import type { Affix, Build, SelectedCell, Weapon } from "@/data/types";

export type EnchantType = {
  id: string;
  name: string;
  lowValue: number;
  hyperValue: number;
};

export const OTHER_ENCHANT_TYPES: EnchantType[] = [
  { id: "xp",     name: "XP",         lowValue: 0.02,   hyperValue: 0.04   },
  { id: "cx",     name: "CX",         lowValue: 0.0275, hyperValue: 0.0549 },
  { id: "range",  name: "Cự ly",      lowValue: 0.03,   hyperValue: 0.03   },
  { id: "damage", name: "Sát thương", lowValue: 0,      hyperValue: 0      },
];

export function resolveSelectedCells(
  build: Build,
  lowMaxQuantity: number,
  hyperMaxQuantity: number,
): SelectedCell[] {
  if (build.selectedCells && build.selectedCells.length > 0) {
    return build.selectedCells;
  }
  const maxCell: SelectedCell = {
    lowQuantity: lowMaxQuantity,
    hyperQuantity: hyperMaxQuantity,
  };
  const defaultFirstCell: SelectedCell = {
    lowQuantity: Math.min(10, lowMaxQuantity),
    hyperQuantity: Math.min(2, hyperMaxQuantity),
  };
  const isSameAsMax =
    defaultFirstCell.lowQuantity === maxCell.lowQuantity &&
    defaultFirstCell.hyperQuantity === maxCell.hyperQuantity;
  return isSameAsMax ? [maxCell] : [defaultFirstCell, maxCell];
}

export function resolveActiveEnchant(build: Build): EnchantType {
  const resolvedId =
    build.otherEnchantId &&
    OTHER_ENCHANT_TYPES.some(type => type.id === build.otherEnchantId)
      ? build.otherEnchantId
      : OTHER_ENCHANT_TYPES[0].id;
  return OTHER_ENCHANT_TYPES.find(type => type.id === resolvedId) ?? OTHER_ENCHANT_TYPES[0];
}

export function formatRemainingSlotsLabel(
  enchantName: string,
  remainingLowSlots: number,
  remainingHyperSlots: number,
): string | null {
  if (remainingLowSlots <= 0 && remainingHyperSlots <= 0) return null;
  const lowPart = remainingLowSlots <= 0 ? "-" : remainingLowSlots;
  const hyperPart = remainingHyperSlots <= 0 ? "-" : remainingHyperSlots;
  return `${enchantName} [${lowPart}|${hyperPart}]`;
}

export function formatSignedPercent(value: number): string {
  const asPercent = value * 100;
  if (!Number.isFinite(asPercent)) return "—";
  if (asPercent === 0) return "0%";
  const rounded = Math.round(asPercent * 100) / 100;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export function formatUnsignedPercent(value: number): string {
  const asPercent = value * 100;
  if (!Number.isFinite(asPercent)) return "—";
  const rounded = Math.round(asPercent * 100) / 100;
  return `${rounded}%`;
}


type CellBreakdownProps = {
  otherEnchant: EnchantType;
  prefix?: Affix;
  suffix?: Affix;
  weapon?: Weapon;
  lowQuantity: number;
  hyperQuantity: number;
  lowMaxQuantity: number;
  hyperMaxQuantity: number;
  bulletsPerSecond: number;
};

export function CellBreakdown({
  otherEnchant,
  prefix,
  suffix,
  weapon,
  lowQuantity,
  hyperQuantity,
  lowMaxQuantity,
  hyperMaxQuantity,
  bulletsPerSecond,
}: CellBreakdownProps) {
  const prefixTck = prefix?.values.tck ?? 0;
  const suffixTck = suffix?.values.tck ?? 0;
  const tckAffixTotal = prefixTck + suffixTck;
  const tckCardContribution = -0.02 * lowQuantity + -0.03 * hyperQuantity;
  const tckTotalModifier = tckAffixTotal + tckCardContribution;

  const remainingLowSlots = Math.max(0, lowMaxQuantity - lowQuantity);
  const remainingHyperSlots = Math.max(0, hyperMaxQuantity - hyperQuantity);

  const alwaysShownEnchantIds = ["cx", "xp"] as const;
  const alwaysShownEnchants = alwaysShownEnchantIds
    .map(id => OTHER_ENCHANT_TYPES.find(type => type.id === id))
    .filter((type): type is EnchantType => Boolean(type));
  const enchantsToShow: EnchantType[] = [...alwaysShownEnchants];
  if (!alwaysShownEnchantIds.includes(otherEnchant.id as (typeof alwaysShownEnchantIds)[number])) {
    enchantsToShow.push(otherEnchant);
  }

  const tckWeaponValue = weapon?.values?.tck ?? 0;
  const tckBaseLabel = tckWeaponValue !== 0 ? `TCK: ${tckWeaponValue}s` : "TCK";
  const tckComputedRate = tckWeaponValue * (1 + tckTotalModifier);
  const tckTotalDisplay =
    tckWeaponValue !== 0
      ? Number.isFinite(tckComputedRate)
        ? `${Math.round(tckComputedRate * 10000) / 10000}s`
        : "—"
      : undefined;

  return (
    <div
      data-testid="cell-breakdown"
      className="w-full min-w-[280px] rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="mb-2 font-semibold text-sky-600 tabular-nums dark:text-sky-400">
        {Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "— v/s"}
      </div>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-1.5 text-xs">
        <span className="font-bold text-red-600 dark:text-red-400">{prefix?.name ?? "—"}</span>
        <span className="font-bold text-neutral-900 dark:text-neutral-100">{weapon?.name ?? "—"}</span>
        <span className="font-bold text-red-600 dark:text-red-400">{suffix?.name ?? "—"}</span>
      </div>
      <div className="flex flex-col gap-1 text-neutral-700 dark:text-neutral-200">
        {enchantsToShow.map(enchant => {
          const affixContribution =
            (prefix?.values[enchant.id] ?? 0) + (suffix?.values[enchant.id] ?? 0);
          const weaponContribution = weapon?.values?.[enchant.id] ?? 0;
          const isSelected = enchant.id === otherEnchant.id;
          const cardContribution = isSelected
            ? enchant.lowValue * remainingLowSlots + enchant.hyperValue * remainingHyperSlots
            : 0;
          const total = affixContribution + weaponContribution + cardContribution;
          const showWeaponValueInLabel =
            alwaysShownEnchantIds.includes(
              enchant.id as (typeof alwaysShownEnchantIds)[number],
            ) || weaponContribution !== 0;
          const enchantLabel = showWeaponValueInLabel
            ? `${enchant.name}: ${formatUnsignedPercent(weaponContribution)}`
            : enchant.name;
          return (
            <BreakdownTriple
              key={enchant.id}
              term={
                <>
                  {enchantLabel}
                  {isSelected && (
                    <SlotSuffix low={remainingLowSlots} hyper={remainingHyperSlots} />
                  )}
                </>
              }
              affixValue={affixContribution}
              cardValue={cardContribution}
              totalValue={total}
            />
          );
        })}
        <BreakdownTriple
          term={
            <>
              {tckBaseLabel}
              <SlotSuffix low={lowQuantity} hyper={hyperQuantity} />
            </>
          }
          affixValue={tckAffixTotal}
          cardValue={tckCardContribution}
          totalValue={tckTotalModifier}
          totalDisplay={tckTotalDisplay}
        />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-neutral-500 dark:text-neutral-400">Đạn trên giây</span>
          <span className="whitespace-nowrap text-right font-semibold tabular-nums text-sky-600 dark:text-sky-400">
            {Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SlotSuffix({ low, hyper }: { low: number; hyper: number }) {
  if (low <= 0 && hyper <= 0) return null;
  const lowPart = low <= 0 ? "-" : low;
  const hyperPart = hyper <= 0 ? "-" : hyper;
  return (
    <span className="ml-1 text-amber-700 dark:text-amber-400">
      [{lowPart}|{hyperPart}]
    </span>
  );
}

type BreakdownTripleProps = {
  term: React.ReactNode;
  affixValue: number;
  cardValue: number;
  totalValue: number;
  totalDisplay?: string;
};

function BreakdownTriple({
  term,
  affixValue,
  cardValue,
  totalValue,
  totalDisplay,
}: BreakdownTripleProps) {
  const affixText = formatSignedPercent(affixValue);
  const cardText = formatSignedPercent(cardValue);
  const totalText = totalDisplay ?? formatSignedPercent(totalValue);
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-neutral-500 dark:text-neutral-400">{term}</span>
      <span className="flex items-baseline whitespace-nowrap text-right text-xs tabular-nums">
        {affixText !== "0%" && (
          <span className="text-emerald-700 dark:text-emerald-400">[{affixText}]</span>
        )}
        {cardText !== "0%" && (
          <span className="text-amber-700 dark:text-amber-400">[{cardText}]</span>
        )}
        <span className="font-semibold text-sky-600 dark:text-sky-400">[{totalText}]</span>
      </span>
    </div>
  );
}
