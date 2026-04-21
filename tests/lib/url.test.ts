// tests/lib/url.test.ts
import { describe, expect, test } from "vitest";
import { encodeBuildsToQuery, decodeBuildsFromQuery } from "@/lib/url";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("url encoding", () => {
  test("encodes a single build as comma-separated fields", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild]);
    const expected = [
      String(defaultAGearBuild.base),
      defaultAGearBuild.prefixId,
      defaultAGearBuild.suffixId,
      defaultAGearBuild.lowCardId,
      String(defaultAGearBuild.lowQuantity),
      defaultAGearBuild.hyperCardId,
      String(defaultAGearBuild.hyperQuantity),
    ].join(",");
    expect(encoded).toBe(expected);
  });

  test("joins multiple builds with semicolons", () => {
    const encoded = encodeBuildsToQuery([defaultAGearBuild, defaultAGearBuild]);
    expect(encoded.split(";")).toHaveLength(2);
  });

  test("round-trips builds through encode then decode, including decimal base", () => {
    const original = [
      defaultAGearBuild,
      { ...defaultAGearBuild, base: 2.25, lowQuantity: 4, hyperQuantity: 2 },
    ];
    const encoded = encodeBuildsToQuery(original);
    const decoded = decodeBuildsFromQuery(encoded, aGearData);
    expect(decoded).toEqual(original);
  });

  test("falls back to the default build when the query is empty", () => {
    const decoded = decodeBuildsFromQuery("", aGearData);
    expect(decoded).toEqual([defaultAGearBuild]);
  });

  test("falls back to defaults when a build field references an unknown id", () => {
    const decoded = decodeBuildsFromQuery("1.5,missing-prefix,none,none,0,none,0", aGearData);
    expect(decoded[0].prefixId).toBe(defaultAGearBuild.prefixId);
  });

  test("falls back to default base when base is not a positive number", () => {
    const decoded = decodeBuildsFromQuery("abc,none,none,none,0,none,0;0,none,none,none,0,none,0", aGearData);
    expect(decoded[0].base).toBe(defaultAGearBuild.base);
    expect(decoded[1].base).toBe(defaultAGearBuild.base);
  });
});
