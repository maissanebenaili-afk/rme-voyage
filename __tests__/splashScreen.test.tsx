import { render, screen, waitFor } from "@testing-library/react";

import SplashScreen from "../components/SplashScreen";

describe("SplashScreen", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("shows once, marks the session, then disappears on its own", async () => {
    render(<SplashScreen />);
    // "RME Voyage" est scindé par un <span> imbriqué (nœuds de texte
    // séparés) : on matche sur "Voyage" seul, texte propre de ce nœud.
    expect(await screen.findByText("Voyage")).toBeInTheDocument();
    expect(sessionStorage.getItem("rme-splash-shown")).toBe("1");

    await waitFor(
      () => expect(screen.queryByText("Voyage")).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it("does not show again once the session flag is already set", async () => {
    sessionStorage.setItem("rme-splash-shown", "1");
    render(<SplashScreen />);
    // Laisse le temps à l'effet de tourner ; rien ne doit apparaître.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("Voyage")).not.toBeInTheDocument();
  });

  it("skips the splash entirely when prefers-reduced-motion is set", async () => {
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    render(<SplashScreen />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("Voyage")).not.toBeInTheDocument();
    // Ne consomme pas non plus la marque de session : rien n'a été montré.
    expect(sessionStorage.getItem("rme-splash-shown")).toBeNull();
  });
});
