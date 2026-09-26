import { render, screen } from "@testing-library/react";

import JuryPack from "../components/JuryPack";

describe("/pitch app link", () => {
  test("QR code text and app button point to the live production site, not an old copy", () => {
    render(<JuryPack />);
    expect(screen.getByRole("link", { name: /Ouvrir l'aperçu de l'app/ })).toHaveAttribute(
      "href",
      "https://rme-route.vercel.app",
    );
    expect(screen.getAllByText("https://rme-route.vercel.app").length).toBeGreaterThan(0);
    expect(screen.queryByText(/rme-voyage-app\.pplx\.app/)).not.toBeInTheDocument();
  });
});
