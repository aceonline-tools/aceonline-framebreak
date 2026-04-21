// app/components/BuildList.tsx
"use client";

import { useState } from "react";
import type { Build } from "@/data/types";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";
import { BuildRow } from "./BuildRow";

export function BuildList() {
  const [builds, setBuilds] = useState<Build[]>([defaultAGearBuild]);

  const updateBuildAt = (indexToUpdate: number, updatedBuild: Build) => {
    setBuilds(previousBuilds =>
      previousBuilds.map((build, index) => (index === indexToUpdate ? updatedBuild : build))
    );
  };

  const appendBuild = () => {
    setBuilds(previousBuilds => [...previousBuilds, defaultAGearBuild]);
  };

  const removeBuildAt = (indexToRemove: number) => {
    setBuilds(previousBuilds =>
      previousBuilds.length <= 1
        ? previousBuilds
        : previousBuilds.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {builds.map((build, index) => (
        <BuildRow
          key={index}
          build={build}
          gearData={aGearData}
          onChange={updatedBuild => updateBuildAt(index, updatedBuild)}
          onRemove={() => removeBuildAt(index)}
        />
      ))}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={appendBuild}
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          + Add build
        </button>
      </div>
    </div>
  );
}
