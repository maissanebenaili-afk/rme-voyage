import { act, fireEvent, render, screen } from "@testing-library/react";

import SmartPacking from "../components/SmartPacking";

// jsdom has no layout, so axe cannot measure contrast here (it is measured in
// a real browser). This computes the WCAG ratio from the inline styles of the
// secondary texts, blended over their near-white backgrounds.
type RGB = [number, number, number];

function parse(color: string): RGB {
  if (color.startsWith("#")) {
    const h = color.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
  }
  return color.match(/\d+/g)!.slice(0, 3).map(Number) as RGB;
}

const blend = (fg: RGB, bg: RGB, alpha: number): RGB =>
  fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as RGB;

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: RGB = [255, 255, 255];
const GOLD_TINT = blend(parse("#f59e0b"), WHITE, 0x22 / 255);

function ratioOf(el: HTMLElement, background: RGB = WHITE): number {
  const opacity = el.style.opacity ? Number(el.style.opacity) : 1;
  return contrast(blend(parse(el.style.color), background, opacity), background);
}

describe("SmartPacking secondary text contrast (WCAG AA 4.5:1)", () => {
  afterEach(() => jest.useRealTimers());

  test("intro text before the list is generated", () => {
    render(<SmartPacking />);
    const intro = screen.getByText(/Choisissez votre type de voyage/);
    expect(ratioOf(intro)).toBeGreaterThanOrEqual(4.5);
  });

  test("footer, category counters and the Suggéré badge", () => {
    jest.useFakeTimers();
    render(<SmartPacking />);
    fireEvent.click(screen.getByRole("button", { name: /Générer la liste/i }));
    act(() => jest.advanceTimersByTime(1000));

    expect(ratioOf(screen.getByText(/Bagages intelligents · Assistant de voyage/))).toBeGreaterThanOrEqual(4.5);
    for (const counter of screen.getAllByText(/emballés$/)) {
      expect(ratioOf(counter)).toBeGreaterThanOrEqual(4.5);
    }
    for (const badge of screen.getAllByText("Suggéré")) {
      expect(ratioOf(badge, GOLD_TINT)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
