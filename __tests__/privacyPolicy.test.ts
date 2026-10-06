import { readFileSync } from "fs";
import { join } from "path";

const read = (file: string) => readFileSync(join(__dirname, "..", file), "utf8");
const policy = read("public/privacy-policy.html");

// Google Play and Apple ask for a policy that matches what the published app
// really does. These checks tie the text to the code it describes.
describe("privacy policy matches the app", () => {
  test("names every third party that receives user data", () => {
    for (const recipient of ["Aladhan", "OpenStreetMap", "Groq", "Google Gemini", "OpenRouter", "Resend", "Stripe", "Netlify"]) {
      expect(policy).toContain(recipient);
    }
  });

  test("lists each AI provider Hadak can call", () => {
    const hadak = read("app/api/hadak/route.ts") + read("lib/hadakAiRouter.ts");
    const providers = { "api.groq.com": "Groq", "generativelanguage.googleapis.com": "Google Gemini", "openrouter.ai": "OpenRouter", "api.openai.com": "OpenAI", "api.anthropic.com": "Anthropic" };
    for (const [host, name] of Object.entries(providers)) {
      if (hadak.includes(host)) expect(policy).toContain(name);
    }
  });

  test("describes the current host and analytics, not the retired Vercel ones", () => {
    expect(policy).not.toMatch(/Vercel|Web Analytics|Speed Insights/);
  });

  test("does not promise things the app does not do", () => {
    expect(policy).not.toMatch(/serveurs EU|mot de passe|Exporter vos données|commissions de réservation|Effacer mon voyage/i);
  });

  // Supabase n'apparaît que pour ce que le code y envoie vraiment : le journal
  // d'événements (lib/eventStore.ts), jamais des comptes ou des profils.
  test("names Supabase only as the event journal the code really writes to", () => {
    expect(read("lib/eventStore.ts")).toMatch(/supabase/i);
    const mentions = policy.match(/[^.<>]*Supabase[^.<>]*/g) ?? [];
    expect(mentions.length).toBeGreaterThan(0);
    for (const sentence of mentions) expect(sentence).toMatch(/événements|base de données/);
    expect(policy).not.toMatch(/compte[^.]*Supabase|Supabase[^.]*compte/i);
  });

  // 2026-10-06 : ces services recevaient l'adresse IP sans être nommés.
  test("names every third party contacted when the home page opens", () => {
    expect(policy).toContain("cdn.jsdelivr.net");
    expect(policy).toContain("tile.openstreetmap.org");
    expect(policy).toMatch(/Aladhan[^<]*Hégire|Hégire[^<]*Aladhan/);
  });

  test("does not point to a contact address on an unregistered domain", () => {
    expect(policy).not.toMatch(/@rme-?voyage\.com/);
  });

  test("names the controller shown in the app footer", () => {
    expect(read("app/HomeClient.tsx")).toContain("Nova Presta");
    expect(policy).toContain("Nova Presta");
  });
});
