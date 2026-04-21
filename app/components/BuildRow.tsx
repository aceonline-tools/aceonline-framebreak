// app/components/BuildRow.tsx
"use client";

import type { Build, GearData } from "@/data/types";

type BuildRowProps = {
  build: Build;
  gearData: GearData;
  onChange: (updatedBuild: Build) => void;
  onRemove: () => void;
};

export function BuildRow({ build, gearData, onChange, onRemove }: BuildRowProps) {
  const bulletsPerSecond = gearData.calculateBulletsPerSecond(build, gearData);
  const formattedBullets = Number.isFinite(bulletsPerSecond) ? bulletsPerSecond.toFixed(2) : "—";

  const updateField = <Key extends keyof Build>(field: Key, value: Build[Key]) => {
    onChange({ ...build, [field]: value });
  };

  const selectedLowCard = gearData.lowCards.find(c => c.id === build.lowCardId);
  const selectedHyperCard = gearData.hyperCards.find(c => c.id === build.hyperCardId);

  return (
    <div className="flex items-stretch gap-4 rounded-lg border border-neutral-200 p-4">
      <div className="flex w-60 flex-col gap-2">
        <LabeledSelect label="Weapon" value={build.weaponId} onChange={v => updateField("weaponId", v)}>
          {gearData.weapons.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Prefix" value={build.prefixId} onChange={v => updateField("prefixId", v)}>
          {gearData.prefixes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Suffix" value={build.suffixId} onChange={v => updateField("suffixId", v)}>
          {gearData.suffixes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </LabeledSelect>
        <LabeledSelect label="Low card" value={build.lowCardId} onChange={v => updateField("lowCardId", v)}>
          {gearData.lowCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
        <LabeledNumber
          label="Low qty"
          value={build.lowQuantity}
          max={selectedLowCard?.maxQuantity ?? 0}
          onChange={v => updateField("lowQuantity", v)}
        />
        <LabeledSelect label="Hyper card" value={build.hyperCardId} onChange={v => updateField("hyperCardId", v)}>
          {gearData.hyperCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </LabeledSelect>
        <LabeledNumber
          label="Hyper qty"
          value={build.hyperQuantity}
          max={selectedHyperCard?.maxQuantity ?? 0}
          onChange={v => updateField("hyperQuantity", v)}
        />
      </div>

      <div className="flex w-40 items-center justify-center rounded border border-dashed border-neutral-300 text-sm text-neutral-400">
        image
      </div>

      <div className="flex flex-1 items-center justify-center">
        <span data-testid="bullets-per-second" className="text-4xl font-semibold tabular-nums">
          {formattedBullets}
        </span>
        <span className="ml-2 text-sm text-neutral-500">b/s</span>
      </div>

      <button
        type="button"
        aria-label="Remove build"
        onClick={onRemove}
        className="self-start rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100"
      >
        ✕
      </button>
    </div>
  );
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
  max: number;
  onChange: (value: number) => void;
};

function LabeledNumber({ label, value, max, onChange }: LabeledNumberProps) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="w-20 text-neutral-600">{label}</span>
      <input
        type="number"
        className="w-20 rounded border border-neutral-300 px-2 py-1"
        min={0}
        max={max}
        value={value}
        onChange={event => {
          const parsed = Number(event.target.value);
          const clamped = Math.max(0, Math.min(max, Number.isFinite(parsed) ? parsed : 0));
          onChange(clamped);
        }}
      />
    </label>
  );
}
