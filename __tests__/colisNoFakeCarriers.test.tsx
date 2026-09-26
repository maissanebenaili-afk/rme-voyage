import { render, screen } from "@testing-library/react";

import ColisWidget from "../components/ColisWidget";

// The carriers listed before were invented (placeholder phones +33 6 00 00 00 2x,
// made-up stars and €/kg prices). Only verified partners may be listed.
describe("ColisWidget shows no invented carriers", () => {
  test("no fictional company, placeholder phone or star rating", () => {
    const { container } = render(<ColisWidget />);
    for (const name of ["Atlas Express Colis", "Maghreb Cargo", "Sud Transit Maroc", "Benelux Maroc Lignes"]) {
      expect(screen.queryByText(name)).toBeNull();
    }
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
    expect(container.textContent).not.toMatch(/€\/kg/);
  });

  test("gives practical advice while the directory is being built", () => {
    render(<ColisWidget />);
    expect(screen.getByText(/Annuaire des transporteurs en préparation/)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
  });
});
