import { render, screen } from "@testing-library/react";
import TripDecisionEngine from "../components/TripDecisionEngine";

describe("TripDecisionEngine — cost breakdown labels match their values", () => {
  it("labels the car-only line distinctly from the car+ferry line", () => {
    render(<TripDecisionEngine />);

    const carOnly = screen.getByText("Voiture (sans ferry)");
    // "Voiture + ferry" also labels the mode-selector button; the breakdown
    // row is the one inside a flex "justify-between" line item.
    const carPlusFerry = screen
      .getAllByText("Voiture + ferry")
      .find((el) => el.parentElement?.classList.contains("justify-between"));
    expect(carOnly).toBeInTheDocument();
    expect(carPlusFerry).toBeInTheDocument();

    const carOnlyValue = carOnly.parentElement?.querySelector("strong")?.textContent;
    const carPlusFerryValue = carPlusFerry?.parentElement?.querySelector("strong")?.textContent;
    // The ferry-inclusive scenario must cost strictly more than the car-only one
    // with the default ferry price (180 €); a shared/duplicate label previously
    // made both rows show the same figure.
    expect(carOnlyValue).not.toBe(carPlusFerryValue);
  });
});
