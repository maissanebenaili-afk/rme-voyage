import { fireEvent, render, screen } from "@testing-library/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TripNav from "@/components/home/TripNav";
import StepHeader from "@/components/home/StepHeader";
import { LANG_STORAGE_KEY, LanguageProvider } from "@/lib/LanguageContext";
import { HOME_TEXT } from "@/lib/homeI18n";
import fs from "fs";
import path from "path";

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
  // Navigateur réglé en français : la langue de départ est le français.
  jest.spyOn(window.navigator, "language", "get").mockReturnValue("fr-FR");
  localStorage.clear();
  document.documentElement.lang = "fr";
  document.documentElement.dir = "ltr";
});

afterEach(() => jest.restoreAllMocks());

// Jusqu'au 2026-10-11, le sélecteur n'avait aucun effet : LanguageProvider
// n'était monté nulle part, setLang était une fonction vide.
describe("changer de langue", () => {
  it("le fournisseur de langue enveloppe toute l'application", () => {
    const layout = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layout).toMatch(/<LanguageProvider>[\s\S]*\{children\}[\s\S]*<\/LanguageProvider>/);
  });

  it("traduit l'accueil quand on choisit l'anglais, et garde ce choix", () => {
    render(<Page />);
    expect(screen.getByRole("link", { name: "Coût" })).toBeInTheDocument();
    expect(screen.getByText("Étape 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Changer de langue" }));
    fireEvent.click(screen.getByRole("button", { name: /English/ }));

    expect(screen.getByRole("link", { name: "Cost" })).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe("en");
  });

  it("reprend la langue enregistrée à la visite suivante, de droite à gauche en arabe", () => {
    localStorage.setItem(LANG_STORAGE_KEY, "ar");
    render(<Page />);
    expect(screen.getByRole("link", { name: "التكلفة" })).toBeInTheDocument();
    expect(document.documentElement.dir).toBe("rtl");
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
        // Les textes à trous (durées, montants) sont des fonctions : on teste ce qu'elles écrivent.
        const sample = typeof value === "function" ? String(value("10 h", "car")) : String(value);
        expect([lang, key, sample.trim().length > 0 && !sample.includes("undefined")]).toEqual([lang, key, true]);
      }
    }
  });
});
