/** @jest-environment node */
import { POST } from "../app/api/events/route";
import { cleanEventProps, RME_EVENTS } from "../lib/rmeEvents";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/events", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  }));

describe("POST /api/events", () => {
  let info: jest.SpyInstance;
  beforeEach(() => {
    info = jest.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => info.mockRestore());

  it("logs one [rme-event] line for a known event", async () => {
    const res = await post({ event: "partner_click", props: { partner: "directferries", product: "ferry", page: "/" } });
    expect(res.status).toBe(204);
    expect(info).toHaveBeenCalledTimes(1);
    const [tag, line] = info.mock.calls[0];
    expect(tag).toBe("[rme-event]");
    expect(JSON.parse(line)).toEqual({ event: "partner_click", partner: "directferries", product: "ferry", page: "/" });
  });

  it("accepts every event the app emits", async () => {
    for (const event of RME_EVENTS) expect((await post({ event })).status).toBe(204);
  });

  it("rejects unknown events, bad JSON, empty and oversized bodies without logging", async () => {
    expect((await post({ event: "drop_table" })).status).toBe(400);
    expect((await post("{not json")).status).toBe(400);
    expect((await post("")).status).toBe(400);
    expect((await post({ event: "partner_click", props: { page: "x".repeat(3000) } })).status).toBe(400);
    expect(info).not.toHaveBeenCalled();
  });

  it("never lets the event name be overwritten by a prop", async () => {
    await post({ event: "route_computed", props: { event: "partner_click" } });
    expect(JSON.parse(info.mock.calls[0][1]).event).toBe("route_computed");
  });
});

describe("cleanEventProps", () => {
  it("keeps short strings, numbers and booleans only", () => {
    expect(cleanEventProps({ a: "ok", b: 3, c: true, d: null, e: { x: 1 }, f: [1], g: NaN })).toEqual({ a: "ok", b: 3, c: true });
  });

  it("drops e-mails, long digit runs and badly named keys", () => {
    expect(cleanEventProps({ email: "a@b.fr", phone: "0612345678", "Bad-Key": "x", ok: "Taza 2" })).toEqual({ ok: "Taza 2" });
  });

  it("truncates strings and caps the number of props", () => {
    const many = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`k_${String.fromCharCode(97 + i)}`, i]));
    expect(Object.keys(cleanEventProps(many))).toHaveLength(12);
    expect(cleanEventProps({ s: "y".repeat(100) }).s).toHaveLength(64);
  });

  it("returns nothing for non-objects", () => {
    expect(cleanEventProps("x")).toEqual({});
    expect(cleanEventProps([1, 2])).toEqual({});
    expect(cleanEventProps(undefined)).toEqual({});
  });
});
