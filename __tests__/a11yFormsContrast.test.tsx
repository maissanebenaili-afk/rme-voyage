import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { render, screen } from "@testing-library/react";

import CurrencyConverter from "../components/CurrencyConverter";

const root = join(__dirname, "..");

describe("form fields are announced by screen readers", () => {
  test("currency converter: each field is tied to its visible label", () => {
    render(<CurrencyConverter />);
    expect(screen.getByLabelText("Montant")).toBeInTheDocument();
    expect(screen.getByLabelText("De")).toBeInTheDocument();
    expect(screen.getByLabelText("Vers")).toBeInTheDocument();
  });

  test.each(["components/RemittanceComparator.tsx", "components/TravelWidgets.tsx", "components/CurrencyConverter.tsx"])(
    "%s: every <label> points to a control",
    (file) => {
      const source = readFileSync(join(root, file), "utf8");
      const labels = source.match(/<label\b[^>]*>/g) ?? [];
      for (const label of labels) expect(label).toMatch(/htmlFor=/);
    },
  );
});

// White text on the brand gold (#c9903a, 2.8:1) or WhatsApp green (#25d366, 2.0:1)
// fails WCAG AA; buttons and badges on those colours use the navy text instead.
describe("no white text on gold or WhatsApp-green backgrounds", () => {
  const skip = /SportsHub|FaicalWidget|TVWidget|__tests__/;
  const files = ["components", "app"]
    .flatMap((dir) => (readdirSync(join(root, dir), { recursive: true }) as string[]).map((f) => join(dir, f)))
    .filter((f) => f.endsWith(".tsx") && !skip.test(f));

  test.each(files)("%s", (file) => {
    const source = readFileSync(join(root, file), "utf8");
    const offending = (source.match(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g) ?? []).filter(
      (s) => /(?<![\w:/-])bg-\[#(c9903a|25d366)\](?!\/)/.test(s) && /(?<![\w:/-])text-white(?![\w/-])/.test(s),
    );
    expect(offending).toEqual([]);
  });
});
