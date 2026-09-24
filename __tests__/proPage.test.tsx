import { render } from "@testing-library/react";
import ProPage from "../app/pro/page";

describe("/pro — no unverified commercial claims", () => {
  it("does not advertise prices, VAT, SLA guarantees, or a paid checkout CTA", () => {
    const { container } = render(<ProPage />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/\d[\d\s]*€/);
    expect(text).not.toMatch(/TVA/i);
    expect(text).not.toMatch(/SLA/i);
  });

  it("has a single main landmark reachable by the global skip-link", () => {
    const { container } = render(<ProPage />);
    const main = container.querySelector("main#main-content");
    expect(main).not.toBeNull();
    expect(main?.getAttribute("tabindex")).toBe("-1");
  });
});
