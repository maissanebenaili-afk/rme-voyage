import { render, screen, within } from "@testing-library/react";
import TripDecisionEngine from "../components/TripDecisionEngine";

describe("TripDecisionEngine — cost breakdown before a route is computed", () => {
  it("does not offer a car-only trip for the default Europe → Morocco journey", () => {
    render(<TripDecisionEngine />);

    // Europe → Maroc passe forcément par un bateau : la ligne et le bouton
    // « voiture sans ferry » afficheraient un prix impossible (285 € pour
    // Paris → Tanger) à côté d'un message disant que le ferry est moins cher.
    expect(screen.queryByText("Voiture (sans ferry)")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Voiture(?!\s*\+)/ })).not.toBeInTheDocument();

    const breakdown = screen.getByTestId("scenario-breakdown");
    const carPlusFerry = within(breakdown).getByText("Voiture + ferry");
    expect(carPlusFerry.parentElement?.querySelector("strong")?.textContent).toMatch(/€/);
    expect(screen.getByRole("button", { name: /Voiture \+ ferry/ })).toHaveAttribute("aria-pressed", "true");
  });
});
