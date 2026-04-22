// app/components/BuildRow.tsx
"use client";

import { useState } from "react";
import type { Affix, Build, GearData } from "@/data/types";

const NEAR_ROUND_THRESHOLD = 0.15;

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

type SelectedCell = { lowQuantity: number; hyperQuantity: number };

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

  const [otherEnchantId, setOtherEnchantId] = useState<string>(OTHER_ENCHANT_TYPES[0].id);
  const activeOtherEnchant =
    OTHER_ENCHANT_TYPES.find(type => type.id === otherEnchantId) ?? OTHER_ENCHANT_TYPES[0];

  const lowMaxQuantity = gearData.lowCards[0]?.maxQuantity ?? 0;
  const hyperMaxQuantity = gearData.hyperCards[0]?.maxQuantity ?? 0;

  const lowQuantities = rangeInclusive(0, lowMaxQuantity);
  const hyperQuantities = rangeInclusive(0, hyperMaxQuantity);

  const maxCell: SelectedCell = {
    lowQuantity: lowMaxQuantity,
    hyperQuantity: hyperMaxQuantity,
  };

  const [selectedCell, setSelectedCell] = useState<SelectedCell>(maxCell);

  const isMaxCell = (cell: SelectedCell) =>
    cell.lowQuantity === maxCell.lowQuantity && cell.hyperQuantity === maxCell.hyperQuantity;

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
  };

  const toggleCellSelection = (candidateCell: SelectedCell) => {
    setSelectedCell(previous => {
      const clickingSameCell =
        previous.lowQuantity === candidateCell.lowQuantity &&
        previous.hyperQuantity === candidateCell.hyperQuantity;
      if (!clickingSameCell) return candidateCell;
      return isMaxCell(candidateCell) ? candidateCell : maxCell;
    });
  };

  return (
    <div
      data-testid="build-row"
      className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4"
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

      <div className="flex flex-col items-start gap-3 overflow-x-auto">
        <ul className="max-w-2xl list-disc space-y-1 pl-5 text-xs leading-relaxed text-neutral-500">
          <li>
            Hàng ngang là <strong className="font-semibold text-neutral-700">Tck thường</strong>.
          </li>
          <li>
            Hàng dọc là <strong className="font-semibold text-neutral-700">Tck DB</strong>.
          </li>
          <li>
            <span className="rounded bg-amber-200 px-1 font-semibold text-amber-900">Bôi vàng</span>{" "}
            là các mốc tròn đạn.
          </li>
          <li>Bấm vào ô để xem chi tiết.</li>
        </ul>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm ring-1 ring-neutral-100">
          <table className="border-separate border-spacing-0 text-sm tabular-nums">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-r border-neutral-200 bg-neutral-100 px-3 py-2 text-left text-[11px] font-semibold text-neutral-600"
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span aria-hidden="true">→</span>
                    <span>{LOW_LABEL}</span>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span aria-hidden="true">↓</span>
                    <span>{HYPER_LABEL}</span>
                  </div>
                </th>
                {lowQuantities.map(lowQuantity => (
                  <th
                    key={lowQuantity}
                    scope="col"
                    className="border-b border-neutral-200 bg-neutral-100 px-3 py-2 text-center text-xs font-semibold text-neutral-600"
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
                        "sticky left-0 z-10 border-r border-neutral-200 bg-neutral-100 px-3 py-2 text-center text-xs font-semibold text-neutral-600 " +
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
                      const isNearRound = isFiniteValue && isNearRoundNumber(bulletsPerSecond);
                      const isSelected =
                        selectedCell.lowQuantity === lowQuantity &&
                        selectedCell.hyperQuantity === hyperQuantity;
                      const isThisMaxCell = isMaxCell({ lowQuantity, hyperQuantity });
                      const isLastCol = colIndex === lowQuantities.length - 1;
                      const shouldShowAmber = !isSelected && (isThisMaxCell || isNearRound);

                      const cellClassName = [
                        "relative p-0",
                        isLastRow ? "" : "border-b border-neutral-200",
                        isLastCol ? "" : "border-r border-neutral-200",
                        isSelected ? "bg-sky-500" : shouldShowAmber ? "bg-amber-200" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const buttonClassName = [
                        "w-full cursor-pointer px-3 py-2 text-center transition-colors",
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

        <CellBreakdown
          otherEnchant={activeOtherEnchant}
          prefix={selectedPrefix}
          suffix={selectedSuffix}
          lowQuantity={selectedCell.lowQuantity}
          hyperQuantity={selectedCell.hyperQuantity}
          lowMaxQuantity={lowMaxQuantity}
          hyperMaxQuantity={hyperMaxQuantity}
          bulletsPerSecond={gearData.calculateBulletsPerSecond(
            build,
            gearData,
            selectedCell.lowQuantity,
            selectedCell.hyperQuantity,
          )}
        />
      </div>
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

  return (
    <div
      data-testid="cell-breakdown"
      className="w-fit min-w-[220px] rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
    >
      <div className="mb-2 font-semibold text-neutral-700">
        {LOW_LABEL} × {lowQuantity}, {HYPER_LABEL} × {hyperQuantity}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-neutral-700">
        <BreakdownLine
          term="Tck"
          value={formatSignedPercent(tckTotalModifier)}
          emphasized
        />
        <BreakdownLine
          term="đạn trên giây"
          value={Number.isFinite(bulletsPerSecond) ? bulletsPerSecond.toFixed(4) : "—"}
          emphasized
        />
        <BreakdownLine
          term={`${otherEnchant.name} (${remainingLowSlots}×thường + ${remainingHyperSlots}×DB)`}
          value={formatSignedPercent(otherEnchantValue)}
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
  const emphasisClass = emphasized ? "font-semibold text-neutral-900" : "";
  return (
    <>
      <dt className={`text-neutral-500 ${emphasisClass}`}>{term}</dt>
      <dd className={`text-right tabular-nums ${emphasisClass}`}>{value}</dd>
    </>
  );
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

function isNearRoundNumber(value: number): boolean {
  const fractionAboveInteger = value - Math.floor(value);
  return fractionAboveInteger < NEAR_ROUND_THRESHOLD;
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

function StackedNumber({ label, value, min = 0, max, step = 1, onChange }: StackedNumberProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <input
        type="number"
        className="w-24 rounded border border-neutral-300 px-2 py-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) {
            onChange(min);
            return;
          }
          const lowerBound = parsed < min ? min : parsed;
          const clamped = max !== undefined && lowerBound > max ? max : lowerBound;
          onChange(clamped);
        }}
      />
    </label>
  );
}
