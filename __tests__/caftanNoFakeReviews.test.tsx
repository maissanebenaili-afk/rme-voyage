import { render, screen } from "@testing-library/react";

import CaftanBooking from "../components/caftan/CaftanBooking";
import { CAFTANS } from "../lib/caftans";

// No review system exists: showing star ratings and review counts would present
// invented customer opinions as real (misleading for users and store policies).
describe("caftans do not display invented reviews", () => {
  test("the catalogue carries no rating or review count", () => {
    for (const caftan of CAFTANS) {
      expect(caftan).not.toHaveProperty("stars");
      expect(caftan).not.toHaveProperty("avis");
    }
  });

  test("the booking card shows no review count", () => {
    render(<CaftanBooking caftan={CAFTANS[0]} />);
    expect(screen.queryByText(/\d+\s*avis/)).toBeNull();
  });
});
