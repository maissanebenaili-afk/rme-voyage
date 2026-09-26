import { execSync } from "child_process";

import { parseContactEmail } from "../lib/contact";

describe("public contact address", () => {
  test("accepts a real address and rejects the unregistered domains", () => {
    expect(parseContactEmail(" equipe@exemple.fr ")).toBe("equipe@exemple.fr");
    expect(parseContactEmail("pro@rme-voyage.com")).toBeNull();
    expect(parseContactEmail("contact@rmevoyage.com")).toBeNull();
    expect(parseContactEmail("pas-un-email")).toBeNull();
    expect(parseContactEmail(undefined)).toBeNull();
  });

  // rme-voyage.com and rmevoyage.com are not registered (DNS NXDOMAIN on
  // 2026-09-26): any mailto to them silently loses the message.
  test("no page links to an address on an unregistered domain", () => {
    const hits = execSync(
      "grep -rlE 'mailto:[^\"]*@(rme-voyage|rmevoyage)\\.com' app components lib || true",
      { cwd: `${__dirname}/..`, encoding: "utf8" },
    ).trim();
    expect(hits).toBe("");
  });
});
