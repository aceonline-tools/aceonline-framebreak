// app/components/BuildList.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Build } from "@/data/types";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";
import { encodeBuildsToQuery, decodeBuildsFromQuery } from "@/lib/url";
import { BuildRow } from "./BuildRow";

const QUERY_KEY = "builds";

type IdentifiedBuild = {
  id: string;
  build: Build;
};

function generateRowId(): string {
  return crypto.randomUUID();
}

function attachRowId(build: Build): IdentifiedBuild {
  return { id: generateRowId(), build };
}

export function BuildList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifiedBuilds, setIdentifiedBuilds] = useState<IdentifiedBuild[]>(() =>
    decodeBuildsFromQuery(searchParams.get(QUERY_KEY) ?? "", aGearData, defaultAGearBuild).map(attachRowId)
  );

  useEffect(() => {
    const encoded = encodeBuildsToQuery(identifiedBuilds.map(entry => entry.build));
    const currentSearch = window.location.search;
    const nextSearch = `?${QUERY_KEY}=${encoded}`;
    if (currentSearch !== nextSearch) {
      router.replace(nextSearch, { scroll: false });
    }
  }, [identifiedBuilds, router]);

  const updateBuildAt = (indexToUpdate: number, updatedBuild: Build) => {
    setIdentifiedBuilds(previousEntries =>
      previousEntries.map((entry, index) =>
        index === indexToUpdate ? { id: entry.id, build: updatedBuild } : entry
      )
    );
  };

  const appendBuild = () => {
    setIdentifiedBuilds(previousEntries => [...previousEntries, attachRowId(defaultAGearBuild)]);
  };

  const removeBuildAt = (indexToRemove: number) => {
    setIdentifiedBuilds(previousEntries =>
      previousEntries.length <= 1
        ? previousEntries
        : previousEntries.filter((_, index) => index !== indexToRemove)
    );
  };

  const [hasJustCopiedLink, setHasJustCopiedLink] = useState(false);
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current);
    };
  }, []);

  const copyShareableLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setHasJustCopiedLink(true);
    if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current);
    copiedResetTimerRef.current = setTimeout(() => setHasJustCopiedLink(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      {identifiedBuilds.map((entry, index) => (
        <BuildRow
          key={entry.id}
          build={entry.build}
          gearData={aGearData}
          onChange={updatedBuild => updateBuildAt(index, updatedBuild)}
          onRemove={() => removeBuildAt(index)}
          canRemove={identifiedBuilds.length > 1}
        />
      ))}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={appendBuild}
          className="cursor-pointer rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
        >
          + Add build
        </button>
        <button
          type="button"
          onClick={copyShareableLink}
          aria-live="polite"
          className={
            "cursor-pointer rounded border px-3 py-1 text-sm transition-colors " +
            (hasJustCopiedLink
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-neutral-300 hover:bg-neutral-100")
          }
        >
          {hasJustCopiedLink ? "Đã copy ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
