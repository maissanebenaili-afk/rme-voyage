/** @jest-environment node */
import { POST } from "../app/api/hadak/report/route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/hadak/report", { method: "POST", body: JSON.stringify(body) }));

describe("POST /api/hadak/report", () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it("records the reported answer in the server logs", async () => {
    const res = await post({ answer: "Réponse douteuse", lang: "fr" });
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith("[hadak-report]", expect.stringContaining("Réponse douteuse"));
  });

  it("rejects empty and oversized reports", async () => {
    expect((await post({ answer: "  " })).status).toBe(400);
    expect((await post({ answer: "x".repeat(2001) })).status).toBe(413);
    expect(warn).not.toHaveBeenCalled();
  });
});
