import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import PrayerWidget from "../components/PrayerWidget";
import QiblaCompass from "../components/QiblaCompass";
import { requestUserPosition } from "../lib/userPosition";

const timings = { data: { timings: { Fajr: "05:58", Dhuhr: "13:42", Asr: "16:58", Maghrib: "19:38", Isha: "21:18" } } };

describe("location is asked only on tap, and never hangs", () => {
  const originalFetch = global.fetch;
  const originalGeo = navigator.geolocation;
  let getCurrentPosition: jest.Mock;

  beforeEach(() => {
    getCurrentPosition = jest.fn();
    Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition }, configurable: true });
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => timings })) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(navigator, "geolocation", { value: originalGeo, configurable: true });
    jest.useRealTimers();
  });

  it("shows Paris prayer times without any location prompt", async () => {
    render(<PrayerWidget />);
    expect(await screen.findByText("13:42")).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/prayer?latitude=48.8566&longitude=2.3522"), expect.anything());
  });

  it("refetches for the user's position after a tap", async () => {
    getCurrentPosition.mockImplementation((ok) => ok({ coords: { latitude: 34.21, longitude: -4.01 } }));
    render(<PrayerWidget />);
    await screen.findByText("13:42");
    fireEvent.click(screen.getByRole("button", { name: /Ma position/ }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("latitude=34.21&longitude=-4.01"), expect.anything()));
    expect(screen.getByText("34.21°, -4.01°")).toBeInTheDocument();
  });

  it("gives up when the permission prompt is ignored", async () => {
    jest.useFakeTimers();
    const pending = requestUserPosition(10_000);
    act(() => { jest.advanceTimersByTime(10_000); });
    await expect(pending).resolves.toBeNull();
  });

  it("shows the Qibla for Paris at once, without asking for location", () => {
    render(<QiblaCompass />);
    expect(screen.getByText("119°")).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
