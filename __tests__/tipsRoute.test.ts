/** @jest-environment node */
import { NextRequest } from "next/server";

import { POST } from "../app/api/tips/route";

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest("http://localhost/api/tips", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/tips", () => {
  test("takes the author from the verified session header, never from the body", async () => {
    const res = await post(
      { location: "Tanger", content: "Arriver tôt au port", userId: "victim-user-000" },
      { "x-user-id": "session-user-42" },
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.user).toBe("User_session-");
  });

  test("rejects a tip without a session identity, even if the body names a user", async () => {
    const res = await post({ location: "Tanger", content: "Arriver tôt", userId: "victim-user-000" });
    expect(res.status).toBe(401);
  });

  test("rejects an oversized tip", async () => {
    const res = await post({ location: "Tanger", content: "x".repeat(1001) }, { "x-user-id": "session-user-42" });
    expect(res.status).toBe(413);
  });
});
