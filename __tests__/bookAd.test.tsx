import { act, fireEvent, render, screen } from "@testing-library/react";
import BookAd from "@/components/BookAd";

describe("BookAd", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => jest.useRealTimers());

  it("sits in the page flow at the end, never floating over the page's buttons", () => {
    render(<BookAd />);
    act(() => jest.runOnlyPendingTimers());
    const ad = screen.getByRole("complementary", { name: "Publicité" });
    // It used to be `fixed bottom-6 left-4` and covered « Comparer les vols » on a phone.
    for (let el: HTMLElement | null = ad; el; el = el.parentElement) {
      expect(el.className).not.toMatch(/\b(fixed|sticky)\b/);
    }
    expect(screen.getByRole("link", { name: /Voir sur Amazon/ })).toHaveAttribute("rel", expect.stringContaining("sponsored"));
  });

  it("stays closed once dismissed", () => {
    const { unmount } = render(<BookAd />);
    act(() => jest.runOnlyPendingTimers());
    fireEvent.click(screen.getByRole("button", { name: "Fermer la publicité" }));
    expect(screen.queryByRole("complementary", { name: "Publicité" })).toBeNull();
    unmount();
    render(<BookAd />);
    act(() => jest.runOnlyPendingTimers());
    expect(screen.queryByRole("complementary", { name: "Publicité" })).toBeNull();
  });
});
