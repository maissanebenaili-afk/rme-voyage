/** @jest-environment node */
import type { Metadata } from "next";

import { metadata as afarah } from "../app/afarah-nassim/layout";
import { metadata as belisamae } from "../app/belisamae/layout";
import { metadata as boutique } from "../app/boutique/layout";
import { metadata as caftans } from "../app/marwa-caftan/layout";
import { generateMetadata as caftanMeta } from "../app/marwa-caftan/[id]/page";
import { metadata as taza } from "../app/taza-immobilier/layout";
import { generateMetadata as propertyMeta } from "../app/taza-immobilier/[id]/page";

const ogImages = (m: Metadata) => (m.openGraph as { images?: unknown[] } | undefined)?.images ?? [];
const titleText = (m: Metadata) => (typeof m.title === "string" ? m.title : (m.title as { default: string }).default);

describe("SEO metadata", () => {
  const layouts = { afarah, belisamae, boutique, caftans, taza };

  test.each(Object.entries(layouts))("%s: the root template adds the brand once, not twice", (_name, m) => {
    expect(titleText(m)).not.toMatch(/RME Voyage$/);
  });

  // A page that redefines openGraph replaces the root object: without an explicit
  // image it had no preview on WhatsApp, Facebook or Google.
  test.each(Object.entries(layouts))("%s: keeps a share image", (_name, m) => {
    expect(ogImages(m).length).toBeGreaterThan(0);
  });

  test("each property page is its own canonical (not the list page) and has a share image", async () => {
    const m = await propertyMeta({ params: Promise.resolve({ id: "p1" }) });
    expect(m.alternates?.canonical).toBe("/taza-immobilier/p1");
    expect(ogImages(m).length).toBeGreaterThan(0);
  });

  test("caftan pages keep a share image", async () => {
    const m = await caftanMeta({ params: Promise.resolve({ id: "c1" }) });
    expect(ogImages(m as Metadata).length).toBeGreaterThan(0);
  });
});
