// tests/lib/url.test.ts
import { describe, expect, test } from "vitest";
import { encodeBuildsToQuery, decodeBuildsFromQuery } from "@/lib/url";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("url encoding", () => {
  test("encodes a single build as dot-separated fields", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild]);
    const expectedBuild = defaultAGearBuild;
    const expected = [
      expectedBuild.weaponId,
      expectedBuild.prefixId,
      expectedBuild.suffixId,
      expectedBuild.lowCardId,
      expectedBuild.lowQuantity,
      expectedBuild.hyperCardId,
      expectedBuild.hyperQuantity,
    ].join(".");
    expect(encoded).toBe(expected);
  });

  test("joins multiple builds with semicolons", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild, defaultAGearBuild]);
    expect(encoded.split(";")).toHaveLength(2);
  });

  test("round-trips builds through encode then decode", () => {
    const original = [defaultAGearBuild, { ...defaultAGearBuild, lowQuantity: 4, hyperQuantity: 2 }];
    const encoded = encodeBuildsToQuery(original);
    const decoded = decodeBuildsFromQuery(encoded, aGearData);
    expect(decoded).toEqual(original);
  });

  test("falls back to the default build when the query is empty", () => {
    const decoded = decodeBuildsFromQuery("", aGearData);
    expect(decoded).toEqual([defaultAGearBuild]);
  });

  test("falls back to defaults when a build field references an unknown id", () => {
    const decoded = decodeBuildsFromQuery("missing-weapon.none.none.none.0.none.0", aGearData);
    expect(decoded[0].weaponId).toBe(defaultAGearBuild.weaponId);
  });
});
