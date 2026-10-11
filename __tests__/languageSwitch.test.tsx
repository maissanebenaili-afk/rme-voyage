import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TripNav from "@/components/home/TripNav";
import StepHeader from "@/components/home/StepHeader";
import { LANG_STORAGE_KEY, LanguageProvider } from "@/lib/LanguageContext";
import { HOME_TEXT } from "@/lib/homeI18n";
import fs from "fs";
import path from "path";

let mockPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

function Page() {
  return (
    <LanguageProvider>
      <LanguageSwitcher />
      <TripNav />
      <StepHeader step={1} title="x" />
    </LanguageProvider>
  );
}

beforeEach(() => {
  mockPathname = "/";
  jest.spyOn(window.navigator, "language", "get").mockReturnValue("fr-FR");
  localStorage.clear();
  document.documentElement.lang = "fr";
  document.documentElement.dir = "ltr";
});

afterEach(() => jest.restoreAllMocks());

describe("changer de langue", () => {
  it("le fournisseur de langue enveloppe toute l'application", () => {
    const layout = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layout).toMatch(/<LanguageProvider>[\s\S]*\{children\}[\s\S]*<\/LanguageProvider>/);
  });

  it("traduit l'accueil quand on choisit l'anglais, et garde ce choix", async () => {
    render(<Page />);
    expect(screen.getByRole("link", { name: "Coût" })).toBeInTheDocument();
    expect(screen.getByText("Étape 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Changer de langue" }));
    fireEvent.click(screen.getByRole("button", { name: /English/ }));

    expect(screen.getByRole("link", { name: "Cost" })).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe("en"));
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe("en");
  });

  it("annonce la darija par son code HTML et conserve le RTL", async () => {
    localStorage.setItem(LANG_STORAGE_KEY, "da");
    render(<Page />);
    await waitFor(() => {
      expect(document.documentElement.lang).toBe("ary");
      expect(document.documentElement.dir).toBe("rtl");
    });
  });

  it("ne confond pas le danois du navigateur avec la darija", async () => {
    // Aucune préférence enregistrée : un navigateur danois ne force pas le code interne darija.
    localStorage.removeItem(LANG_STORAGE_KEY);
    jest.spyOn(window.navigator, "language", "get").mockReturnValue("da-DK");
    render(<Page />);
    await waitFor(() => expect(document.documentElement.lang).toBe("fr"));
    expect(document.documentElement.dir).toBe("ltr");
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
  });

  it("réinitialise le document en français en quittant l'accueil non traduit", async () => {
    localStorage.setItem(LANG_STORAGE_KEY, "en");
    mockPathname = "/trajet/paris-tanger";
    render(<Page />);
    await waitFor(() => {
      expect(document.documentElement.lang).toBe("fr");
      expect(document.documentElement.dir).toBe("ltr");
    });
    // La préférence est conservée, mais le document non traduit annonce le français.
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe("en");
  });

  it("ignore une valeur enregistrée inconnue", () => {
    localStorage.setItem(LANG_STORAGE_KEY, "constructor");
    render(<Page />);
    expect(screen.getByRole("link", { name: "Coût" })).toBeInTheDocument();
  });

  it("chaque langue a chaque texte de l'accueil, jamais vide", () => {
    const keys = Object.keys(HOME_TEXT.fr);
    for (const [lang, texts] of Object.entries(HOME_TEXT)) {
      expect(Object.keys(texts).sort()).toEqual([...keys].sort());
      for (const key of keys) {
        const value = (texts as Record<string, unknown>)[key];
        const sample = typeof value === "function" ? String(value("10 h", "car")) : String(value);
        expect([lang, key, sample.trim().length > 0 && !sample.includes("undefined")]).toEqual([lang, key, true]);
      }
    }
  });
});
