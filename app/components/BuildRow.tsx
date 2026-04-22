// app/components/BuildRow.tsx
"use client";

import { useEffect, useState } from "react";
import type { Affix, Build, GearData, SelectedCell } from "@/data/types";

const NEAR_ROUND_THRESHOLD = 0.2;
const NEAR_HALF_MIN = 0.5;
const NEAR_HALF_MAX = 0.52;

const LOW_LABEL = "Tck thường";
const HYPER_LABEL = "Tck DB";
const PREFIX_LABEL = "Sup đầu";
const SUFFIX_LABEL = "Sup đuôi";
const BASE_LABEL = "Tck cơ bản";
const ENCHANT_LABEL = "Enchant khác";

type EnchantType = {
  id: string;
  name: string;
  lowValue: number;
  hyperValue: number;
};

const OTHER_ENCHANT_TYPES: EnchantType[] = [
  { id: "xp",    name: "XP",    lowValue: 0.02,   hyperValue: 0.04   },
  { id: "cx",    name: "CX",    lowValue: 0.0275, hyperValue: 0.0549 },
  { id: "range", name: "Cự ly", lowValue: 0.03,   hyperValue: 0.03   },
];

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

  const lowQuantities = rangeInclusive(0, lowMaxQuantity);
  const hyperQuantities = rangeInclusive(0, hyperMaxQuantity);

  const maxCell: SelectedCell = {
    lowQuantity: lowMaxQuantity,
    hyperQuantity: hyperMaxQuantity,
  };

  const defaultSelectedCells: SelectedCell[] = (() => {
    const defaultFirstCell: SelectedCell = {
      lowQuantity: Math.min(10, lowMaxQuantity),
      hyperQuantity: Math.min(2, hyperMaxQuantity),
    };
    const isSameAsMax =
      defaultFirstCell.lowQuantity === maxCell.lowQuantity &&
      defaultFirstCell.hyperQuantity === maxCell.hyperQuantity;
    return isSameAsMax ? [maxCell] : [defaultFirstCell, maxCell];
  })();

  const selectedCells =
    build.selectedCells && build.selectedCells.length > 0
      ? build.selectedCells
      : defaultSelectedCells;

  const otherEnchantId =
    build.otherEnchantId &&
    OTHER_ENCHANT_TYPES.some(type => type.id === build.otherEnchantId)
      ? build.otherEnchantId
      : OTHER_ENCHANT_TYPES[0].id;
  const activeOtherEnchant =
    OTHER_ENCHANT_TYPES.find(type => type.id === otherEnchantId) ?? OTHER_ENCHANT_TYPES[0];

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

  const sortedSelectedCells = [...selectedCells].sort((first, second) => {
    if (first.hyperQuantity !== second.hyperQuantity) {
      return first.hyperQuantity - second.hyperQuantity;
    }
    return first.lowQuantity - second.lowQuantity;
  });

  type HoveredCellInfo = SelectedCell & { anchorX: number; anchorBottom: number };
  const [hoveredCellInfo, setHoveredCellInfo] = useState<HoveredCellInfo | null>(null);

  return (
    <div
      data-testid="build-row"
      className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <StackedNumber
          label={BASE_LABEL}
          value={build.base}
          min={0}
          step={0.01}
          onChange={nextBase => updateField("base", nextBase)}
        />
        <StackedSelect label={PREFIX_LABEL} value={build.prefixId} onChange={v => updateField("prefixId", v)}>
          {gearData.prefixes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </StackedSelect>
        <StackedSelect label={SUFFIX_LABEL} value={build.suffixId} onChange={v => updateField("suffixId", v)}>
          {gearData.suffixes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </StackedSelect>
        <StackedSelect label={ENCHANT_LABEL} value={otherEnchantId} onChange={setOtherEnchantId}>
          {OTHER_ENCHANT_TYPES.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
        </StackedSelect>

        <button
          type="button"
          aria-label="Remove build"
          onClick={onRemove}
          disabled={!canRemove}
          className="ml-auto self-start rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          ✕
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm ring-1 ring-neutral-100">
          <table className="border-separate border-spacing-0 text-[11px] tabular-nums sm:w-full sm:text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-neutral-100 px-1.5 py-1 text-left text-[9px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-[11px]"
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
                    className="border-b border-neutral-200 bg-neutral-100 px-1.5 py-1 text-center text-[10px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-xs"
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
                  <tr key={hyperQuantity} className={rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50/60"}>
                    <th
                      scope="row"
                      className={
                        "sticky left-0 z-10 border-r border-neutral-200 bg-neutral-100 px-1.5 py-1 text-center text-[10px] font-semibold text-neutral-600 sm:px-3 sm:py-2 sm:text-xs " +
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
                      const isFirstRow = rowIndex === 0;
                      const isOnHighlightEdge = isFirstRow || isLastCol;
                      const shouldShowAmber =
                        !isSelected &&
                        isOnHighlightEdge &&
                        (isThisMaxCell || isNearInteger || isNearHalf);

                      const cellClassName = [
                        "relative p-0",
                        isLastRow ? "" : "border-b border-neutral-200",
                        isLastCol ? "" : "border-r border-neutral-200",
                        isSelected ? "bg-sky-500" : shouldShowAmber ? "bg-amber-200" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const buttonClassName = [
                        "w-full cursor-pointer px-1.5 py-1 text-center transition-colors sm:px-3 sm:py-2",
                        !isSelected && !shouldShowAmber && "hover:bg-sky-50 text-neutral-400",
                        !isSelected && shouldShowAmber && "hover:bg-amber-300 font-bold text-amber-900",
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

        <div className="flex flex-wrap gap-3">
          {sortedSelectedCells.map(cell => (
            <CellBreakdown
              key={`${cell.lowQuantity}-${cell.hyperQuantity}`}
              otherEnchant={activeOtherEnchant}
              prefix={selectedPrefix}
              suffix={selectedSuffix}
              lowQuantity={cell.lowQuantity}
              hyperQuantity={cell.hyperQuantity}
              lowMaxQuantity={lowMaxQuantity}
              hyperMaxQuantity={hyperMaxQuantity}
              bulletsPerSecond={gearData.calculateBulletsPerSecond(
                build,
                gearData,
                cell.lowQuantity,
                cell.hyperQuantity,
              )}
            />
          ))}
        </div>
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

type CellBreakdownProps = {
  otherEnchant: EnchantType;
  prefix?: Affix;
  suffix?: Affix;
  lowQuantity: number;
  hyperQuantity: number;
  lowMaxQuantity: number;
  hyperMaxQuantity: number;
  bulletsPerSecond: number;
};

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
  const prefixValue = prefix?.value ?? 0;
  const suffixValue = suffix?.value ?? 0;
  const tckCardContribution = -0.02 * lowQuantity + -0.03 * hyperQuantity;
  const tckTotalModifier = prefixValue + suffixValue + tckCardContribution;

  const remainingLowSlots = Math.max(0, lowMaxQuantity - lowQuantity);
  const remainingHyperSlots = Math.max(0, hyperMaxQuantity - hyperQuantity);
  const prefixBonus = prefix?.bonuses?.[otherEnchant.id] ?? 0;
  const suffixBonus = suffix?.bonuses?.[otherEnchant.id] ?? 0;
  const otherEnchantValue =
    otherEnchant.lowValue * remainingLowSlots +
    otherEnchant.hyperValue * remainingHyperSlots +
    prefixBonus +
    suffixBonus;

  const tckSlotsLabel = formatRemainingSlotsLabel("Tck", lowQuantity, hyperQuantity) ?? "Tck";
  const enchantSlotsLabel = formatRemainingSlotsLabel(
    otherEnchant.name,
    remainingLowSlots,
    remainingHyperSlots,
  );

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: anchorBottom - 8,
        left: anchorX,
        transform: "translate(-50%, -100%)",
      }}
      className="pointer-events-none z-50 hidden min-w-[180px] rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 shadow-lg sm:block"
    >
      <div className="mb-1 font-semibold text-neutral-900 tabular-nums">
        {Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "— v/s"}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-neutral-500">{tckSlotsLabel}</dt>
        <dd className="text-right font-semibold tabular-nums">
          {formatSignedPercent(tckTotalModifier)}
        </dd>
        {enchantSlotsLabel && (
          <>
            <dt className="text-neutral-500">{enchantSlotsLabel}</dt>
            <dd className="text-right font-semibold tabular-nums">
              {formatSignedPercent(otherEnchantValue)}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

function CellBreakdown({
  otherEnchant,
  prefix,
  suffix,
  lowQuantity,
  hyperQuantity,
  lowMaxQuantity,
  hyperMaxQuantity,
  bulletsPerSecond,
}: CellBreakdownProps) {
  const prefixValue = prefix?.value ?? 0;
  const suffixValue = suffix?.value ?? 0;
  const tckCardContribution = -0.02 * lowQuantity + -0.03 * hyperQuantity;
  const tckTotalModifier = prefixValue + suffixValue + tckCardContribution;

  const remainingLowSlots = Math.max(0, lowMaxQuantity - lowQuantity);
  const remainingHyperSlots = Math.max(0, hyperMaxQuantity - hyperQuantity);
  const prefixBonus = prefix?.bonuses?.[otherEnchant.id] ?? 0;
  const suffixBonus = suffix?.bonuses?.[otherEnchant.id] ?? 0;
  const otherEnchantValue =
    otherEnchant.lowValue * remainingLowSlots +
    otherEnchant.hyperValue * remainingHyperSlots +
    prefixBonus +
    suffixBonus;

  const remainingSlotsLabel = formatRemainingSlotsLabel(
    otherEnchant.name,
    remainingLowSlots,
    remainingHyperSlots,
  );
  const tckSlotsLabel = formatRemainingSlotsLabel("Tck", lowQuantity, hyperQuantity) ?? "Tck";

  return (
    <div
      data-testid="cell-breakdown"
      className="w-fit min-w-[220px] rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
    >
      <div className="mb-2 font-semibold text-neutral-700 tabular-nums">
        {Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "— v/s"}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-neutral-700">
        {remainingSlotsLabel && (
          <BreakdownLine
            term={remainingSlotsLabel}
            value={formatSignedPercent(otherEnchantValue)}
            emphasized
          />
        )}
        <BreakdownLine
          term={tckSlotsLabel}
          value={formatSignedPercent(tckTotalModifier)}
          emphasized
        />
        <BreakdownLine
          term="Đạn trên giây"
          value={Number.isFinite(bulletsPerSecond) ? `${bulletsPerSecond.toFixed(2)} v/s` : "—"}
          emphasized
        />
      </dl>
    </div>
  );
}

type BreakdownLineProps = {
  term: string;
  value: string;
  emphasized?: boolean;
};

function BreakdownLine({ term, value, emphasized = false }: BreakdownLineProps) {
  const valueEmphasisClass = emphasized ? "font-semibold text-neutral-900" : "";
  return (
    <>
      <dt className="text-neutral-500">{term}</dt>
      <dd className={`text-right tabular-nums ${valueEmphasisClass}`}>{value}</dd>
    </>
  );
}

function formatRemainingSlotsLabel(
  enchantName: string,
  remainingLowSlots: number,
  remainingHyperSlots: number,
): string | null {
  const parts: string[] = [];
  if (remainingLowSlots > 0) parts.push(`${remainingLowSlots}×thường`);
  if (remainingHyperSlots > 0) parts.push(`${remainingHyperSlots}×DB`);
  if (parts.length === 0) return null;
  return `${enchantName} (${parts.join(" + ")})`;
}

function formatSignedPercent(value: number): string {
  const asPercent = value * 100;
  if (!Number.isFinite(asPercent)) return "—";
  if (asPercent === 0) return "0%";
  const rounded = Math.round(asPercent * 100) / 100;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
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
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <select
        className="rounded border border-neutral-300 px-2 py-1"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

type StackedNumberProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

function StackedNumber({ label, value, min = 0, max, onChange }: StackedNumberProps) {
  const [rawInput, setRawInput] = useState<string>(() => String(value));

  useEffect(() => {
    const parsedRaw = parseDecimalInput(rawInput);
    if (parsedRaw === null || parsedRaw !== value) {
      setRawInput(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextRaw = event.target.value;
    setRawInput(nextRaw);

    const parsed = parseDecimalInput(nextRaw);
    if (parsed === null) return;

    const lowerBound = parsed < min ? min : parsed;
    const clamped = max !== undefined && lowerBound > max ? max : lowerBound;
    if (clamped !== value) onChange(clamped);
  };

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        className="w-24 rounded border border-neutral-300 px-2 py-1"
        value={rawInput}
        onChange={handleChange}
      />
    </label>
  );
}

function parseDecimalInput(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();
  if (normalized === "" || normalized === "." || normalized === "-") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
