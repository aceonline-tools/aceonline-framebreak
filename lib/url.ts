// lib/url.ts
import type { Build, GearData } from "@/data/types";

const FIELD_SEPARATOR = ",";
const BUILD_SEPARATOR = ";";

const DEFAULT_BASE = 1.5;

export function encodeBuildsToQuery(builds: Build[]): string {
  return builds
    .map(build =>
      [
        String(build.base),
        build.prefixId,
        build.suffixId,
        build.lowCardId,
        String(build.lowQuantity),
        build.hyperCardId,
        String(build.hyperQuantity),
      ].join(FIELD_SEPARATOR)
    )
    .join(BUILD_SEPARATOR);
}

export function decodeBuildsFromQuery(queryValue: string, gearData: GearData): Build[] {
  const defaultBuild: Build = {
    base:          DEFAULT_BASE,
    prefixId:      gearData.prefixes[0].id,
    suffixId:      gearData.suffixes[0].id,
    lowCardId:     gearData.lowCards[0].id,
    lowQuantity:   0,
    hyperCardId:   gearData.hyperCards[0].id,
    hyperQuantity: 0,
  };

  if (!queryValue) return [defaultBuild];

  const parsedBuilds = queryValue
    .split(BUILD_SEPARATOR)
    .map(rawBuild => {
      const [
        baseString,
        prefixId,
        suffixId,
        lowCardId,
        lowQuantityString,
        hyperCardId,
        hyperQuantityString,
      ] = rawBuild.split(FIELD_SEPARATOR);

      const resolveAffixId = <T extends { id: string }>(
        items: T[],
        candidateId: string | undefined,
        fallback: string,
      ): string => (items.some(item => item.id === candidateId) ? candidateId! : fallback);

      const parsedBase = Number(baseString);
      const parsedLowQuantity = Number(lowQuantityString);
      const parsedHyperQuantity = Number(hyperQuantityString);

      return {
        base:          Number.isFinite(parsedBase) && parsedBase > 0 ? parsedBase : defaultBuild.base,
        prefixId:      resolveAffixId(gearData.prefixes,   prefixId,    defaultBuild.prefixId),
        suffixId:      resolveAffixId(gearData.suffixes,   suffixId,    defaultBuild.suffixId),
        lowCardId:     resolveAffixId(gearData.lowCards,   lowCardId,   defaultBuild.lowCardId),
        lowQuantity:   Number.isFinite(parsedLowQuantity) ? parsedLowQuantity : 0,
        hyperCardId:   resolveAffixId(gearData.hyperCards, hyperCardId, defaultBuild.hyperCardId),
        hyperQuantity: Number.isFinite(parsedHyperQuantity) ? parsedHyperQuantity : 0,
      } satisfies Build;
    });

  return parsedBuilds.length > 0 ? parsedBuilds : [defaultBuild];
}
