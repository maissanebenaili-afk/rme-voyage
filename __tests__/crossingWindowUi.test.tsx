import { fireEvent, render, screen } from "@testing-library/react";
import CrossingWindow from "../components/lab/CrossingWindow";
import { tripFromRoutePage } from "../lib/lab/crossingWindow/trips";

test("the Lab screen ranks days, flags the cross-border trap and shows sources with their status", () => {
  const paris = tripFromRoutePage("paris-tanger")!;
  render(<CrossingWindow trips={[paris]} />);
  expect(screen.getByRole("heading", { name: "Quand partir ?" })).toBeInTheDocument();
  expect(screen.getAllByText(/Route française calme, mais arrivée au port un jour chargé/).length).toBeGreaterThan(0);
  const rows = screen.getAllByRole("button");
  fireEvent.click(rows[rows.length - 1]);
  expect(screen.getAllByText(/\[(CONFIRMÉ|À VÉRIFIER|INFÉRENCE|INCONNU)\]/).length).toBeGreaterThan(0);
});
