// app/components/BuildRow.tsx
"use client";

import type { Build, GearData } from "@/data/types";

const NEAR_ROUND_THRESHOLD = 0.05;

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

  const lowMaxQuantity = selectedLowCard?.maxQuantity ?? 0;
  const hyperMaxQuantity = selectedHyperCard?.maxQuantity ?? 0;

  const lowQuantities = rangeInclusive(0, lowMaxQuantity);
  const hyperQuantities = rangeInclusive(0, hyperMaxQuantity);

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
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

      <div className="flex flex-1 items-start justify-center overflow-x-auto">
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
                  const isFinite = Number.isFinite(bulletsPerSecond);
                  const displayValue = isFinite ? bulletsPerSecond.toFixed(2) : "—";
                  const isNearRound = isFinite && isNearRoundNumber(bulletsPerSecond);
                  return (
                    <td
                      key={lowQuantity}
                      className={
                        "border border-neutral-200 px-2 py-1 text-center " +
                        (isNearRound ? "bg-amber-100 font-bold text-amber-900" : "")
                      }
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
