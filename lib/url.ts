// lib/url.ts
import type { Build, GearData, SelectedCell } from "@/data/types";

const FIELD_SEPARATOR = ",";
const BUILD_SEPARATOR = ";";
const CELL_SEPARATOR = "|";
const CELL_COORD_SEPARATOR = "x";

function encodeSelectedCells(cells: SelectedCell[] | undefined): string {
  if (!cells || cells.length === 0) return "";
  return cells
    .map(cell => `${cell.lowQuantity}${CELL_COORD_SEPARATOR}${cell.hyperQuantity}`)
    .join(CELL_SEPARATOR);
}

function decodeSelectedCells(raw: string | undefined): SelectedCell[] | undefined {
  if (!raw) return undefined;
  const cells: SelectedCell[] = [];
  for (const part of raw.split(CELL_SEPARATOR)) {
    const [lowRaw, hyperRaw] = part.split(CELL_COORD_SEPARATOR);
    const parsedLow = Number(lowRaw);
    const parsedHyper = Number(hyperRaw);
    if (!Number.isFinite(parsedLow) || !Number.isFinite(parsedHyper)) continue;
    cells.push({ lowQuantity: parsedLow, hyperQuantity: parsedHyper });
  }
  return cells.length > 0 ? cells : undefined;
}

function trimTrailingEmptyFields(fields: string[]): string[] {
  const trimmed = [...fields];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") {
    trimmed.pop();
  }
  return trimmed;
}

export function encodeBuildsToQuery(builds: Build[]): string {
  return builds
    .map(build => {
      const fields = [
        String(build.base),
        build.prefixId,
        build.suffixId,
        encodeSelectedCells(build.selectedCells),
        build.otherEnchantId ?? "",
      ];
      return trimTrailingEmptyFields(fields).join(FIELD_SEPARATOR);
    })
    .join(BUILD_SEPARATOR);
}

export function decodeBuildsFromQuery(
  queryValue: string,
  gearData: GearData,
  defaultBuild: Build,
): Build[] {
  if (!queryValue) return [defaultBuild];

  const parsedBuilds = queryValue
    .split(BUILD_SEPARATOR)
    .map(rawBuild => {
      const [baseString, prefixId, suffixId, cellsString, otherEnchantIdString] =
        rawBuild.split(FIELD_SEPARATOR);

      const resolveAffixId = <T extends { id: string }>(
        items: T[],
        candidateId: string | undefined,
        fallback: string,
      ): string => (items.some(item => item.id === candidateId) ? candidateId! : fallback);

      const parsedBase = Number(baseString);

      return {
        base:           Number.isFinite(parsedBase) && parsedBase > 0 ? parsedBase : defaultBuild.base,
        prefixId:       resolveAffixId(gearData.prefixes, prefixId, defaultBuild.prefixId),
        suffixId:       resolveAffixId(gearData.suffixes, suffixId, defaultBuild.suffixId),
        selectedCells:  decodeSelectedCells(cellsString) ?? defaultBuild.selectedCells,
        otherEnchantId: otherEnchantIdString || defaultBuild.otherEnchantId,
      } satisfies Build;
    });

  return parsedBuilds.length > 0 ? parsedBuilds : [defaultBuild];
}
