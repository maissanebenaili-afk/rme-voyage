import { completeness, extractTripFacts } from "../lib/tripFacts";
import { LAB_SCENARIOS } from "../lib/lab/scenarios";

describe("RME Test Lab — intent scenarios", () => {
  test.each(LAB_SCENARIOS)("$id: $sentence", ({ sentence, expect: e }) => {
    const f = extractTripFacts(sentence);
    expect(f.destination?.value.key).toBe(e.destination);
    expect(f.origin?.value.label).toBe(e.origin);
    expect(f.via?.value.key).toBe(e.via);
    expect(f.when?.value.month).toBe(e.month);
    expect(f.travellers?.value.family).toBe(e.family);
    expect(f.mode?.value).toBe(e.mode);
    expect(f.purpose?.value).toBe(e.purpose);
    expect([...f.unknown].sort()).toEqual([...e.unknown].sort());
    expect(completeness(f)).toBe((5 - e.unknown.length) / 5);
    // Everything that comes out was said by the user.
    for (const k of ["destination", "origin", "via", "when", "travellers", "mode", "purpose"] as const) {
      if (f[k]) expect(f[k]!.status).toBe("FACT_USER");
    }
  });

  test("Omra: no administrative fact is produced at this layer", () => {
    const f = extractTripFacts("Préparer une omra depuis Lyon en mars") as Record<string, unknown>;
    expect(Object.keys(f).sort()).toEqual(["destination", "origin", "purpose", "unknown", "when"]);
    expect((f.destination as { value: { country: string } }).value.country).toBe("SA");
  });
});

describe("one intent, several languages", () => {
  const sentences = [
    "Je vais à Taza en août avec ma famille",
    "bghit nmshi l Taza f ghusht m3a l3a2ila",
    "Ik ga in augustus met mijn gezin naar Taza",
    "Voy a Taza en agosto con mi familia",
    "Vado a Taza ad agosto con la mia famiglia",
    "I am going to Taza in August with my family",
  ];
  test.each(sentences)("%s", (s) => {
    const f = extractTripFacts(s);
    expect(f.destination?.value.key).toBe("taza");
    expect(f.when?.value.month).toBe(8);
    expect(f.travellers?.value.family).toBe(true);
  });
});

describe("adversarial: unknown stays unknown", () => {
  test("no place, no date, no mode → everything unknown, nothing invented", () => {
    const f = extractTripFacts("je veux partir");
    expect(f.unknown.sort()).toEqual(["destination", "mode", "origin", "travellers", "when"]);
  });
  test("an everyday word is not a city", () => {
    expect(extractTripFacts("c'est sale").destination).toBeUndefined();
    expect(extractTripFacts("safi, merci").destination).toBeUndefined();
  });
  test("an impossible day is dropped, the month kept", () => {
    const f = extractTripFacts("à Taza le 45 août");
    expect(f.when?.value).toEqual({ month: 8 });
  });
  test("a valid day is kept; the year only when written", () => {
    expect(extractTripFacts("à Tanger le 12 août").when?.value).toEqual({ month: 8, day: 12 });
    expect(extractTripFacts("à Tanger le 12 août 2027").when?.value).toEqual({ month: 8, day: 12, year: 2027 });
  });
  test("very long or odd input does not throw", () => {
    expect(() => extractTripFacts("x".repeat(10_000))).not.toThrow();
    expect(extractTripFacts(undefined as unknown as string).unknown).toHaveLength(5);
  });
});
