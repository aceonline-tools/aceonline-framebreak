// app/components/ComparisonPanel.tsx
"use client";

import type { Build, GearData, SelectedCell } from "@/data/types";
import {
  CellBreakdown,
  resolveActiveEnchant,
  resolveSelectedCells,
} from "./shared";

type ComparisonEntry = {
  id: string;
  build: Build;
};

type ComparisonPanelProps = {
  entries: ComparisonEntry[];
  gearData: GearData;
};

function cellKey(cell: SelectedCell): string {
  return `${cell.lowQuantity}-${cell.hyperQuantity}`;
}

function sortCellsForComparison(cells: SelectedCell[]): SelectedCell[] {
  return [...cells].sort((first, second) => {
    const firstTotal = first.lowQuantity + first.hyperQuantity;
    const secondTotal = second.lowQuantity + second.hyperQuantity;
    if (firstTotal !== secondTotal) return secondTotal - firstTotal;
    if (first.hyperQuantity !== second.hyperQuantity) {
      return second.hyperQuantity - first.hyperQuantity;
    }
    return second.lowQuantity - first.lowQuantity;
  });
}

export function ComparisonPanel({ entries, gearData }: ComparisonPanelProps) {
  const lowMaxQuantity = gearData.lowCards[0]?.maxQuantity ?? 0;
  const hyperMaxQuantity = gearData.hyperCards[0]?.maxQuantity ?? 0;

  const uniqueSelectedCells = new Map<string, SelectedCell>();
  for (const entry of entries) {
    const resolvedCells = resolveSelectedCells(entry.build, lowMaxQuantity, hyperMaxQuantity);
    for (const cell of resolvedCells) {
      uniqueSelectedCells.set(cellKey(cell), cell);
    }
  }
  const sortedUniqueCells = sortCellsForComparison(Array.from(uniqueSelectedCells.values()));

  if (sortedUniqueCells.length === 0) return null;

  return (
    <section
      data-testid="comparison-panel"
      className="mt-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">So sánh</h2>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Các ô đã chọn — cùng cột = cùng cấu hình thẻ</p>
      </header>

      <div className="overflow-x-auto">
        <div className="flex min-w-fit flex-col gap-3">
          {entries.map((entry, buildIndex) => (
            <ComparisonRow
              key={entry.id}
              entry={entry}
              buildIndex={buildIndex}
              gearData={gearData}
              sortedCells={sortedUniqueCells}
              lowMaxQuantity={lowMaxQuantity}
              hyperMaxQuantity={hyperMaxQuantity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type ComparisonRowProps = {
  entry: ComparisonEntry;
  buildIndex: number;
  gearData: GearData;
  sortedCells: SelectedCell[];
  lowMaxQuantity: number;
  hyperMaxQuantity: number;
};

function ComparisonRow({
  entry,
  buildIndex,
  gearData,
  sortedCells,
  lowMaxQuantity,
  hyperMaxQuantity,
}: ComparisonRowProps) {
  const { build } = entry;
  const prefix = gearData.prefixes.find(p => p.id === build.prefixId);
  const suffix = gearData.suffixes.find(s => s.id === build.suffixId);
  const weapon = gearData.weapons.find(w => w.values.tck === build.base);
  const activeOtherEnchant = resolveActiveEnchant(build);

  const selectedCells = resolveSelectedCells(build, lowMaxQuantity, hyperMaxQuantity);
  const selectedCellKeys = new Set(selectedCells.map(cellKey));

  return (
    <div className="flex items-start gap-3">
      <div className="w-20 shrink-0 pt-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
        Build #{buildIndex + 1}
      </div>
      <div className="flex items-stretch gap-3">
        {sortedCells.map(cell => {
          const key = cellKey(cell);
          if (!selectedCellKeys.has(key)) {
            return (
              <div
                key={key}
                aria-hidden="true"
                className="w-[280px] shrink-0 rounded-md border border-dashed border-neutral-200 bg-neutral-50/40 dark:border-neutral-700 dark:bg-neutral-800/30"
              />
            );
          }
          const bulletsPerSecond = gearData.calculateBulletsPerSecond(
            build,
            gearData,
            cell.lowQuantity,
            cell.hyperQuantity,
          );
          return (
            <div key={key} className="flex w-[280px] shrink-0">
              <CellBreakdown
                otherEnchant={activeOtherEnchant}
                prefix={prefix}
                suffix={suffix}
                weapon={weapon}
                lowQuantity={cell.lowQuantity}
                hyperQuantity={cell.hyperQuantity}
                lowMaxQuantity={lowMaxQuantity}
                hyperMaxQuantity={hyperMaxQuantity}
                bulletsPerSecond={bulletsPerSecond}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
