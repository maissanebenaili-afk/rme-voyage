import { render, screen } from "@testing-library/react";
import BookBanner from "@/components/BookBanner";

describe("BookBanner", () => {
  it("shows no star rating without a sourced reader rating", () => {
    const { container } = render(<BookBanner />);
    expect(screen.getByText("par Tarek Benaïli")).toBeInTheDocument();
    // Five hard-coded stars read as a reader rating that does not exist.
    expect(container.querySelectorAll("svg.lucide-star")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/★/);
  });

  it("is the #livre target linked from the home footer", () => {
    const { container } = render(<BookBanner />);
    expect(container.querySelector("section#livre")).not.toBeNull();
  });
});
