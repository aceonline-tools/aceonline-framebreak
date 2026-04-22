// app/components/BuildRow.tsx
"use client";

import { useState } from "react";
import type { Affix, Build, EnchantCard, GearData } from "@/data/types";

const NEAR_ROUND_THRESHOLD = 0.2;

const LOW_LABEL = "Tck thường";
const HYPER_LABEL = "Tck DB";
const PREFIX_LABEL = "Sup đầu";
const SUFFIX_LABEL = "Sup đuôi";
const BASE_LABEL = "Tck cơ bản";

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
  const activeLowCard = gearData.lowCards[0];
  const activeHyperCard = gearData.hyperCards[0];

  const lowMaxQuantity = activeLowCard?.maxQuantity ?? 0;
  const hyperMaxQuantity = activeHyperCard?.maxQuantity ?? 0;

  const lowQuantities = rangeInclusive(0, lowMaxQuantity);
  const hyperQuantities = rangeInclusive(0, hyperMaxQuantity);

  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>({
    lowQuantity: lowMaxQuantity,
    hyperQuantity: hyperMaxQuantity,
  });

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
  };

  const toggleCellSelection = (candidateCell: SelectedCell) => {
    setSelectedCell(previous =>
      previous &&
      previous.lowQuantity === candidateCell.lowQuantity &&
      previous.hyperQuantity === candidateCell.hyperQuantity
        ? null
        : candidateCell
    );
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
                        !!selectedCell &&
                        selectedCell.lowQuantity === lowQuantity &&
                        selectedCell.hyperQuantity === hyperQuantity;
                      const isLastCol = colIndex === lowQuantities.length - 1;

                      const cellClassName = [
                        "relative p-0",
                        isLastRow ? "" : "border-b border-neutral-200",
                        isLastCol ? "" : "border-r border-neutral-200",
                        isSelected
                          ? "bg-sky-500"
                          : isNearRound
                            ? "bg-amber-200"
                            : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const buttonClassName = [
                        "w-full cursor-pointer px-3 py-2 text-center transition-colors",
                        !isSelected && !isNearRound && "hover:bg-sky-50",
                        !isSelected && isNearRound && "hover:bg-amber-300",
                        isNearRound && !isSelected && "font-bold text-amber-900",
                        isSelected && "font-bold text-white",
                        !isNearRound && !isSelected && "text-neutral-700",
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

        {selectedCell && (
          <CellBreakdown
            prefix={selectedPrefix}
            suffix={selectedSuffix}
            lowCard={activeLowCard}
            hyperCard={activeHyperCard}
            lowQuantity={selectedCell.lowQuantity}
            hyperQuantity={selectedCell.hyperQuantity}
            bulletsPerSecond={gearData.calculateBulletsPerSecond(
              build,
              gearData,
              selectedCell.lowQuantity,
              selectedCell.hyperQuantity,
            )}
            onDismiss={() => setSelectedCell(null)}
          />
        )}
      </div>
    </div>
  );
}

type CellBreakdownProps = {
  prefix?: Affix;
  suffix?: Affix;
  lowCard?: EnchantCard;
  hyperCard?: EnchantCard;
  lowQuantity: number;
  hyperQuantity: number;
  bulletsPerSecond: number;
  onDismiss: () => void;
};

function CellBreakdown({
  prefix,
  suffix,
  lowCard,
  hyperCard,
  lowQuantity,
  hyperQuantity,
  bulletsPerSecond,
  onDismiss,
}: CellBreakdownProps) {
  const prefixValue = prefix?.value ?? 0;
  const suffixValue = suffix?.value ?? 0;
  const lowContribution = (lowCard?.value ?? 0) * lowQuantity;
  const hyperContribution = (hyperCard?.value ?? 0) * hyperQuantity;
  const totalModifier = prefixValue + suffixValue + lowContribution + hyperContribution;

  return (
    <div
      data-testid="cell-breakdown"
      className="w-fit min-w-[220px] rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-neutral-700">
          {LOW_LABEL} × {lowQuantity}, {HYPER_LABEL} × {hyperQuantity}
        </span>
        <button
          type="button"
          aria-label="Close breakdown"
          onClick={onDismiss}
          className="rounded px-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
        >
          ✕
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-neutral-700">
        <BreakdownLine
          term="Tck"
          value={formatSignedPercent(totalModifier)}
          emphasized
        />
        <BreakdownLine
          term="đạn trên giây"
          value={Number.isFinite(bulletsPerSecond) ? bulletsPerSecond.toFixed(4) : "—"}
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
