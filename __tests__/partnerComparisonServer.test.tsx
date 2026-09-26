import { render, screen, waitFor, within } from "@testing-library/react";

import PartnerComparison from "../components/PartnerComparison";
import type { PartnerCatalogueEntry } from "@/lib/partnerCatalogue";

const pending: PartnerCatalogueEntry = {
  id: "direct-ferries",
  name: "Direct Ferries",
  category: "ferry",
  description: "Comparaison de traversées.",
  status: "pending",
  publicUrl: "https://www.directferries.fr/",
  envVar: "DIRECT_FERRIES_AFFILIATE_URL",
  commissionNote: "",
};

const card = () => screen.getByRole("link", { name: /Direct Ferries/ });

describe("PartnerComparison", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("shows the affiliate link configured on the server (env vars are not readable in the browser)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        partners: [{ ...pending, status: "active", affiliateUrl: "https://www.directferries.fr/?aff=RME" }],
      }),
    }) as unknown as typeof fetch;

    render(<PartnerComparison partners={[pending]} />);

    await waitFor(() => expect(card()).toHaveAttribute("href", "https://www.directferries.fr/?aff=RME"));
    expect(within(card()).getByText("Affilié")).toBeInTheDocument();
    expect(card()).toHaveAttribute("rel", "sponsored noopener noreferrer");
    expect(global.fetch).toHaveBeenCalledWith("/api/partners", expect.objectContaining({ cache: "no-store" }));
  });

  test("keeps the public links when the server route is unavailable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    render(<PartnerComparison partners={[pending]} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(card()).toHaveAttribute("href", "https://www.directferries.fr/");
    expect(within(card()).getByText("À activer")).toBeInTheDocument();
  });
});
