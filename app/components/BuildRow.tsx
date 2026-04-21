// app/components/BuildRow.tsx
"use client";

import { useState } from "react";
import type { Affix, Build, EnchantCard, GearData } from "@/data/types";

const NEAR_ROUND_THRESHOLD = 0.05;

type SelectedCell = { lowQuantity: number; hyperQuantity: number };

type BuildRowProps = {
  build: Build;
  gearData: GearData;
  onChange: (updatedBuild: Build) => void;
  onRemove: () => void;
  canRemove?: boolean;
};

export function BuildRow({ build, gearData, onChange, onRemove, canRemove = true }: BuildRowProps) {
  const selectedLowCard = gearData.lowCards.find(c => c.id === build.lowCardId);
  const selectedHyperCard = gearData.hyperCards.find(c => c.id === build.hyperCardId);
  const selectedPrefix = gearData.prefixes.find(p => p.id === build.prefixId);
  const selectedSuffix = gearData.suffixes.find(s => s.id === build.suffixId);

  const lowMaxQuantity = Math.max(0, ...gearData.lowCards.map(c => c.maxQuantity));
  const hyperMaxQuantity = Math.max(0, ...gearData.hyperCards.map(c => c.maxQuantity));

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
      className="flex flex-col gap-4 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-stretch"
    >
      <div className="flex w-60 shrink-0 flex-col gap-2">
        <LabeledNumber
          label="Base"
          value={build.base}
          min={0}
          step={0.01}
          onChange={nextBase => updateField("base", nextBase)}
        />
        <LabeledSelect label="Prefix" value={build.prefixId} onChange={v => updateField("prefixId", v)}>
          {gearData.prefixes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Suffix" value={build.suffixId} onChange={v => updateField("suffixId", v)}>
          {gearData.suffixes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Low card" value={build.lowCardId} onChange={v => updateField("lowCardId", v)}>
          {gearData.lowCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Hyper card" value={build.hyperCardId} onChange={v => updateField("hyperCardId", v)}>
          {gearData.hyperCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
      </div>

      <div className="flex flex-1 flex-col items-start gap-3 overflow-x-auto">
        <table className="border-separate border-spacing-0 text-sm tabular-nums">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500">
                hyper \ low
              </th>
              {lowQuantities.map(lowQuantity => (
                <th
                  key={lowQuantity}
                  className="bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500"
                >
                  {lowQuantity}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hyperQuantities.map(hyperQuantity => (
              <tr key={hyperQuantity}>
                <th className="sticky left-0 z-10 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500">
                  {hyperQuantity}
                </th>
                {lowQuantities.map(lowQuantity => {
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

                  const cellClassName = [
                    "border border-neutral-200 p-0",
                    isSelected
                      ? "bg-sky-200 ring-2 ring-sky-500"
                      : isNearRound
                        ? "bg-amber-100"
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const buttonClassName = [
                    "w-full px-2 py-1 text-center transition hover:bg-neutral-100",
                    isNearRound && !isSelected ? "font-bold text-amber-900" : "",
                    isSelected ? "font-semibold text-sky-900" : "",
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
            ))}
          </tbody>
        </table>

        {selectedCell && (
          <CellBreakdown
            build={build}
            prefix={selectedPrefix}
            suffix={selectedSuffix}
            lowCard={selectedLowCard}
            hyperCard={selectedHyperCard}
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

      <button
        type="button"
        aria-label="Remove build"
        onClick={onRemove}
        disabled={!canRemove}
        className="self-start rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        ✕
      </button>
    </div>
  );
}

type CellBreakdownProps = {
  build: Build;
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
  build,
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
  const divisor = build.base * (1 + totalModifier);

  return (
    <div
      data-testid="cell-breakdown"
      className="w-full max-w-md rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-neutral-700">
          Low × {lowQuantity}, Hyper × {hyperQuantity}
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
      <dl className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 text-neutral-700">
        <BreakdownLine
          term="Prefix"
          description={prefix?.name ?? "(none)"}
          value={formatSignedPercent(prefixValue)}
        />
        <BreakdownLine
          term="Suffix"
          description={suffix?.name ?? "(none)"}
          value={formatSignedPercent(suffixValue)}
        />
        <BreakdownLine
          term="Low"
          description={`${lowCard?.name ?? "(none)"} × ${lowQuantity}`}
          value={formatSignedPercent(lowContribution)}
        />
        <BreakdownLine
          term="Hyper"
          description={`${hyperCard?.name ?? "(none)"} × ${hyperQuantity}`}
          value={formatSignedPercent(hyperContribution)}
        />
        <BreakdownLine
          term="Total"
          description="sum of modifiers"
          value={formatSignedPercent(totalModifier)}
          emphasized
        />
        <BreakdownLine
          term="Divisor"
          description={`${build.base} × (1 ${formatSignedPercent(totalModifier)})`}
          value={Number.isFinite(divisor) ? divisor.toFixed(4) : "—"}
        />
        <BreakdownLine
          term="BPS"
          description="3 ÷ divisor"
          value={Number.isFinite(bulletsPerSecond) ? bulletsPerSecond.toFixed(4) : "—"}
          emphasized
        />
      </dl>
    </div>
  );
}

type BreakdownLineProps = {
  term: string;
  description: string;
  value: string;
  emphasized?: boolean;
};

function BreakdownLine({ term, description, value, emphasized = false }: BreakdownLineProps) {
  const emphasisClass = emphasized ? "font-semibold text-neutral-900" : "";
  return (
    <>
      <dt className={`text-neutral-500 ${emphasisClass}`}>{term}</dt>
      <dd className={`text-neutral-600 ${emphasisClass}`}>{description}</dd>
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
  const distanceToNearestInteger = Math.abs(value - Math.round(value));
  return distanceToNearestInteger < NEAR_ROUND_THRESHOLD;
}

type LabeledSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function LabeledSelect({ label, value, onChange, children }: LabeledSelectProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="w-20 text-neutral-600">{label}</span>
      <select
        className="flex-1 rounded border border-neutral-300 px-2 py-1"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

type LabeledNumberProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

function LabeledNumber({ label, value, min = 0, max, step = 1, onChange }: LabeledNumberProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="w-20 text-neutral-600">{label}</span>
      <input
        type="number"
        className="w-20 rounded border border-neutral-300 px-2 py-1"
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
