import { act, fireEvent, render, screen } from "@testing-library/react";

import SmartPacking from "../components/SmartPacking";

// The list is built from fixed rules (trip type, duration, season): the UI
// must not claim an AI that does not exist.
const AI_CLAIM = /\bIA\b|l['’]IA/;

describe("SmartPacking labels", () => {
  afterEach(() => jest.useRealTimers());

  test("claims no AI, before and after generating the list", () => {
    jest.useFakeTimers();
    const { container } = render(<SmartPacking />);
    expect(container.textContent).not.toMatch(AI_CLAIM);

    fireEvent.click(screen.getByRole("button", { name: /Générer la liste/i }));
    act(() => jest.advanceTimersByTime(1000));

    expect(screen.getAllByText("Suggéré").length).toBeGreaterThan(0);
    expect(container.textContent).not.toMatch(AI_CLAIM);
  });
});
