// app/components/BuildRow.tsx
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Affix, Build, GearData, SelectedCell } from "@/data/types";
import {
  type EnchantType,
  OTHER_ENCHANT_TYPES,
  formatRemainingSlotsLabel,
  formatSignedPercent,
  resolveActiveEnchant,
  resolveSelectedCells,
} from "./shared";

const NEAR_ROUND_THRESHOLD = 0.2;
const NEAR_HALF_MIN = 0.5;
const NEAR_HALF_MAX = 0.52;

const LOW_LABEL = "TCK thường";
const HYPER_LABEL = "TCK DB";
const PREFIX_LABEL = "Sup đầu";
const SUFFIX_LABEL = "Sup đuôi";
const WEAPON_LABEL = "Vũ khí";
const ENCHANT_LABEL = "Enchant khác";

type BuildRowProps = {
  build: Build;
  gearData: GearData;
  onChange: (updatedBuild: Build) => void;
  onRemove: () => void;
  canRemove?: boolean;
};

export function BuildRow({ build, gearData, onChange, onRemove, canRemove = true }: BuildRowProps) {
  const selectedPrefix = gearData.prefixes.find(p => p.id === build.prefixId);
  const selectedSuffix = gearData.suffixes.find(s => s.id === build.suffixId);

  const lowMaxQuantity = gearData.lowCards[0]?.maxQuantity ?? 0;
  const hyperMaxQuantity = gearData.hyperCards[0]?.maxQuantity ?? 0;

  const lowQuantities = rangeInclusive(0, lowMaxQuantity).reverse();
  const hyperQuantities = rangeInclusive(0, hyperMaxQuantity).reverse();

  const maxCell: SelectedCell = {
    lowQuantity: lowMaxQuantity,
    hyperQuantity: hyperMaxQuantity,
  };

  const selectedCells = resolveSelectedCells(build, lowMaxQuantity, hyperMaxQuantity);

  const activeOtherEnchant = resolveActiveEnchant(build);
  const otherEnchantId = activeOtherEnchant.id;

  const selectedWeapon =
    gearData.weapons.find(weapon => weapon.values.tck === build.base) ?? gearData.weapons[0];
  const selectedWeaponId = selectedWeapon?.id ?? "";

  const handleWeaponChange = (nextWeaponId: string) => {
    const nextWeapon = gearData.weapons.find(weapon => weapon.id === nextWeaponId);
    const nextBase = nextWeapon?.values.tck;
    if (nextBase === undefined) return;
    updateField("base", nextBase);
  };

  const isMaxCell = (cell: SelectedCell) =>
    cell.lowQuantity === maxCell.lowQuantity && cell.hyperQuantity === maxCell.hyperQuantity;

  const cellsAreEqual = (first: SelectedCell, second: SelectedCell) =>
    first.lowQuantity === second.lowQuantity && first.hyperQuantity === second.hyperQuantity;

  const isCellSelected = (cell: SelectedCell) =>
    selectedCells.some(selected => cellsAreEqual(selected, cell));

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
  };

  const toggleCellSelection = (candidateCell: SelectedCell) => {
    const alreadySelected = selectedCells.some(selected =>
      cellsAreEqual(selected, candidateCell),
    );
    const nextCells = alreadySelected
      ? selectedCells.filter(selected => !cellsAreEqual(selected, candidateCell))
      : [...selectedCells, candidateCell];
    const fallbackCells = nextCells.length > 0 ? nextCells : [maxCell];
    updateField("selectedCells", fallbackCells);
  };

  const setOtherEnchantId = (nextId: string) => {
    updateField("otherEnchantId", nextId);
  };

  type HoveredCellInfo = SelectedCell & { anchorX: number; anchorBottom: number };
  const [hoveredCellInfo, setHoveredCellInfo] = useState<HoveredCellInfo | null>(null);
  const [isFullGridVisible, setIsFullGridVisible] = useState(false);

  const totalCardsMax = lowMaxQuantity + hyperMaxQuantity;
  const combinedCardProgression = rangeInclusive(1, totalCardsMax)
    .reverse()
    .map(totalCards => {
      const lowQuantity = Math.min(totalCards, lowMaxQuantity);
      const hyperQuantity = totalCards - lowQuantity;
      return {
        totalCards,
        lowQuantity,
        hyperQuantity,
        bulletsPerSecond: gearData.calculateBulletsPerSecond(
          build,
          gearData,
          lowQuantity,
          hyperQuantity,
        ),
      };
    });

  return (
    <div
      data-testid="build-row"
      className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 p-3 pr-10 sm:p-4 sm:pr-12 dark:border-neutral-700"
    >
      <button
        type="button"
        aria-label="Remove build"
        onClick={onRemove}
        disabled={!canRemove}
        className="absolute right-2 top-2 cursor-pointer rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        ✕
      </button>
      <div className="flex flex-wrap items-end gap-3">
        <StackedSelect label={PREFIX_LABEL} value={build.prefixId} onChange={v => updateField("prefixId", v)}>
          {gearData.prefixes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </StackedSelect>
        <StackedSelect label={WEAPON_LABEL} value={selectedWeaponId} onChange={handleWeaponChange}>
          {gearData.weapons.map(weapon => (
            <option key={weapon.id} value={weapon.id}>{weapon.name}</option>
          ))}
        </StackedSelect>
        <StackedSelect label={SUFFIX_LABEL} value={build.suffixId} onChange={v => updateField("suffixId", v)}>
          {gearData.suffixes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </StackedSelect>
        <StackedSelect label={ENCHANT_LABEL} value={otherEnchantId} onChange={setOtherEnchantId}>
          {OTHER_ENCHANT_TYPES.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
        </StackedSelect>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <FocusedList
          title="Tổng số thẻ TCK"
          quantityHeader="Tổng thẻ"
          entries={combinedCardProgression}
          isCellSelected={isCellSelected}
          onToggleCell={toggleCellSelection}
          onHoverEnter={(cell, anchor) => setHoveredCellInfo({ ...cell, ...anchor })}
          onHoverLeave={() => setHoveredCellInfo(null)}
          quantityExtractor={entry => entry.totalCards ?? entry.lowQuantity}
        />

        <div>
          <button
            type="button"
            onClick={() => setIsFullGridVisible(previous => !previous)}
            aria-expanded={isFullGridVisible}
            className="cursor-pointer text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            {isFullGridVisible ? "▾ Ẩn toàn bảng" : "▸ Xem toàn bảng"}
          </button>
        </div>

        {isFullGridVisible && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm ring-1 ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-neutral-800">
          <table className="border-separate border-spacing-0 text-[11px] tabular-nums sm:w-full sm:text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-neutral-100 px-1.5 py-1 text-left text-[9px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-[11px] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <div className="flex items-center gap-0.5 whitespace-nowrap sm:gap-1">
                    <span aria-hidden="true">→</span>
                    <span>{LOW_LABEL}</span>
                  </div>
                  <div className="flex items-center gap-0.5 whitespace-nowrap sm:gap-1">
                    <span aria-hidden="true">↓</span>
                    <span>{HYPER_LABEL}</span>
                  </div>
                </th>
                {lowQuantities.map(lowQuantity => (
                  <th
                    key={lowQuantity}
                    scope="col"
                    className="border-b border-neutral-200 bg-neutral-100 px-1.5 py-1 text-center text-[10px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {lowQuantity}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hyperQuantities.map((hyperQuantity, rowIndex) => {
                const isLastRow = rowIndex === hyperQuantities.length - 1;
                return (
                  <tr key={hyperQuantity} className={rowIndex % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50/60 dark:bg-neutral-800/40"}>
                    <th
                      scope="row"
                      className={
                        "sticky left-0 z-10 border-r border-neutral-200 bg-neutral-100 px-1.5 py-1 text-center text-[10px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 " +
                        (isLastRow ? "" : "border-b")
                      }
                    >
                      {hyperQuantity}
                    </th>
                    {lowQuantities.map((lowQuantity, colIndex) => {
                      const bulletsPerSecond = gearData.calculateBulletsPerSecond(
                        build,
                        gearData,
                        lowQuantity,
                        hyperQuantity,
                      );
                      const isFiniteValue = Number.isFinite(bulletsPerSecond);
                      const displayValue = isFiniteValue ? bulletsPerSecond.toFixed(2) : "—";
                      const isNearInteger = isFiniteValue && isNearIntegerNumber(bulletsPerSecond);
                      const isNearHalf = isFiniteValue && isNearHalfNumber(bulletsPerSecond);
                      const isSelected = isCellSelected({ lowQuantity, hyperQuantity });
                      const isThisMaxCell = isMaxCell({ lowQuantity, hyperQuantity });
                      const isLastCol = colIndex === lowQuantities.length - 1;
                      const isFirstCol = colIndex === 0;
                      const isOnHighlightEdge = isLastRow || isFirstCol;
                      const shouldShowAmber =
                        !isSelected &&
                        isOnHighlightEdge &&
                        (isThisMaxCell || isNearInteger || isNearHalf);

                      const cellClassName = [
                        "relative p-0",
                        isLastRow ? "" : "border-b border-neutral-200 dark:border-neutral-700",
                        isLastCol ? "" : "border-r border-neutral-200 dark:border-neutral-700",
                        isSelected
                          ? "bg-sky-500 dark:bg-sky-600"
                          : shouldShowAmber
                          ? "bg-amber-200 dark:bg-amber-900/40"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const buttonClassName = [
                        "w-full cursor-pointer px-1.5 py-1 text-center transition-colors sm:px-3 sm:py-2",
                        !isSelected && !shouldShowAmber && "hover:bg-sky-50 text-neutral-400 dark:hover:bg-sky-950 dark:text-neutral-500",
                        !isSelected && shouldShowAmber && "hover:bg-amber-300 font-bold text-amber-900 dark:hover:bg-amber-800 dark:text-amber-300",
                        isSelected && "font-bold text-white",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <td key={lowQuantity} className={cellClassName}>
                          <button
                            type="button"
                            onClick={() => toggleCellSelection({ lowQuantity, hyperQuantity })}
                            onMouseEnter={event => {
                              const rect = event.currentTarget.getBoundingClientRect();
                              setHoveredCellInfo({
                                lowQuantity,
                                hyperQuantity,
                                anchorX: rect.left + rect.width / 2,
                                anchorBottom: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredCellInfo(null)}
                            aria-pressed={isSelected}
                            className={buttonClassName}
                          >
                            {displayValue}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
      {hoveredCellInfo && (
        <CellHoverTooltip
          anchorX={hoveredCellInfo.anchorX}
          anchorBottom={hoveredCellInfo.anchorBottom}
          build={build}
          gearData={gearData}
          prefix={selectedPrefix}
          suffix={selectedSuffix}
          otherEnchant={activeOtherEnchant}
          lowQuantity={hoveredCellInfo.lowQuantity}
          hyperQuantity={hoveredCellInfo.hyperQuantity}
          lowMaxQuantity={lowMaxQuantity}
          hyperMaxQuantity={hyperMaxQuantity}
        />
      )}
    </div>
  );
}

type FocusedListEntry = {
  lowQuantity: number;
  hyperQuantity: number;
  bulletsPerSecond: number;
  totalCards?: number;
};

type FocusedListProps = {
  title: string;
  quantityHeader: string;
  entries: FocusedListEntry[];
  isCellSelected: (cell: SelectedCell) => boolean;
  onToggleCell: (cell: SelectedCell) => void;
  onHoverEnter: (cell: SelectedCell, anchor: { anchorX: number; anchorBottom: number }) => void;
  onHoverLeave: () => void;
  quantityExtractor?: (entry: FocusedListEntry) => number;
};

function FocusedList({
  title,
  quantityHeader,
  entries,
  isCellSelected,
  onToggleCell,
  onHoverEnter,
  onHoverLeave,
  quantityExtractor = entry => entry.lowQuantity,
}: FocusedListProps) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm ring-1 ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:ring-neutral-800">
      <div className="flex items-baseline justify-between gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        <span>{title}</span>
        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">{quantityHeader}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1 p-2 text-sm tabular-nums">
        {entries.map(entry => {
          const isFiniteValue = Number.isFinite(entry.bulletsPerSecond);
          const displayValue = isFiniteValue ? entry.bulletsPerSecond.toFixed(2) : "—";
          const isSelected = isCellSelected({
            lowQuantity: entry.lowQuantity,
            hyperQuantity: entry.hyperQuantity,
          });

          const handleClick = () => {
            onToggleCell({
              lowQuantity: entry.lowQuantity,
              hyperQuantity: entry.hyperQuantity,
            });
          };

          const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onHoverEnter(
              { lowQuantity: entry.lowQuantity, hyperQuantity: entry.hyperQuantity },
              { anchorX: rect.left + rect.width / 2, anchorBottom: rect.top },
            );
          };

          const cellBackground = isSelected
            ? "bg-sky-500 text-white border-sky-600 dark:bg-sky-600 dark:border-sky-500"
            : "bg-white text-neutral-700 hover:bg-sky-50 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-sky-950 dark:border-neutral-700";

          return (
            <button
              key={`${entry.lowQuantity}-${entry.hyperQuantity}`}
              type="button"
              onClick={handleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={onHoverLeave}
              aria-pressed={isSelected}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-md border px-2 py-1 text-xs transition-colors ${cellBackground}`}
            >
              <span className="text-[10px] opacity-70">{quantityExtractor(entry)}</span>
              <span className="font-semibold">
                {displayValue}
                <span className="ml-0.5 text-[10px] font-normal opacity-70">v/s</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type CellHoverTooltipProps = {
  anchorX: number;
  anchorBottom: number;
  build: Build;
  gearData: GearData;
  prefix?: Affix;
  suffix?: Affix;
  otherEnchant: EnchantType;
  lowQuantity: number;
  hyperQuantity: number;
  lowMaxQuantity: number;
  hyperMaxQuantity: number;
};

function CellHoverTooltip({
  anchorX,
  anchorBottom,
  build,
  gearData,
  prefix,
  suffix,
  otherEnchant,
  lowQuantity,
  hyperQuantity,
  lowMaxQuantity,
  hyperMaxQuantity,
}: CellHoverTooltipProps) {
  const bulletsPerSecond = gearData.calculateBulletsPerSecond(
    build,
    gearData,
    lowQuantity,
    hyperQuantity,
  );
  const prefixTck = prefix?.values.tck ?? 0;
  const suffixTck = suffix?.values.tck ?? 0;
  const tckCardContribution = -0.02 * lowQuantity + -0.03 * hyperQuantity;
  const tckTotalModifier = prefixTck + suffixTck + tckCardContribution;

  const remainingLowSlots = Math.max(0, lowMaxQuantity - lowQuantity);
  const remainingHyperSlots = Math.max(0, hyperMaxQuantity - hyperQuantity);
  const prefixBonus = prefix?.values[otherEnchant.id] ?? 0;
  const suffixBonus = suffix?.values[otherEnchant.id] ?? 0;
  const otherEnchantValue =
    otherEnchant.lowValue * remainingLowSlots +
    otherEnchant.hyperValue * remainingHyperSlots +
    prefixBonus +
    suffixBonus;

  const tckSlotsLabel = formatRemainingSlotsLabel("TCK", lowQuantity, hyperQuantity) ?? "TCK";
  const enchantSlotsLabel =
    formatRemainingSlotsLabel(otherEnchant.name, remainingLowSlots, remainingHyperSlots) ??
    otherEnchant.name;

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: anchorBottom - 8,
        left: anchorX,
        transform: "translate(-50%, -100%)",
      }}
      className="pointer-events-none z-50 hidden min-w-[180px] rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 shadow-lg sm:block dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
    >
      <div className="mb-1 font-semibold text-neutral-900 tabular-nums dark:text-neutral-50">
        {Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "— v/s"}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-neutral-500 dark:text-neutral-400">{enchantSlotsLabel}</dt>
        <dd className="text-right font-semibold tabular-nums">
          {formatSignedPercent(otherEnchantValue)}
        </dd>
        <dt className="text-neutral-500 dark:text-neutral-400">{tckSlotsLabel}</dt>
        <dd className="text-right font-semibold tabular-nums">
          {formatSignedPercent(tckTotalModifier)}
        </dd>
      </dl>
    </div>
  );
}

function rangeInclusive(startInclusive: number, endInclusive: number): number[] {
  const values: number[] = [];
  for (let current = startInclusive; current <= endInclusive; current += 1) {
    values.push(current);
  }
  return values;
}

function isNearIntegerNumber(value: number): boolean {
  const fractionAboveInteger = value - Math.floor(value);
  return fractionAboveInteger < NEAR_ROUND_THRESHOLD;
}

function isNearHalfNumber(value: number): boolean {
  const fractionAboveInteger = value - Math.floor(value);
  return fractionAboveInteger >= NEAR_HALF_MIN && fractionAboveInteger <= NEAR_HALF_MAX;
}


type StackedSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function StackedSelect({ label, value, onChange, children }: StackedSelectProps) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const measurerRef = useRef<HTMLSpanElement>(null);
  const [selectWidth, setSelectWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const select = selectRef.current;
    const measurer = measurerRef.current;
    if (!select || !measurer) return;
    const selectedOption = select.options[select.selectedIndex];
    measurer.textContent = selectedOption?.textContent ?? "";
    setSelectWidth(measurer.offsetWidth + 40);
  }, [value, children]);

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="relative inline-block">
        <select
          ref={selectRef}
          style={{ width: selectWidth }}
          className="h-8 appearance-none rounded border border-neutral-300 bg-white bg-[length:12px_12px] bg-[position:right_0.5rem_center] bg-no-repeat px-2 pr-7 text-sm leading-none bg-[image:url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23737373%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%209%2012%2015%2018%209%22/></svg>')] dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          value={value}
          onChange={event => onChange(event.target.value)}
        >
          {children}
        </select>
        <span
          ref={measurerRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre text-sm leading-none"
        />
      </span>
    </label>
  );
}

