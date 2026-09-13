const newsItems = [
  {
    title: "Période de pointe estivale",
    description:
      "Les ferries Tarifa-Tanger et Algésiras-Tanger sont très fréquentés de juin à septembre. Réservez plusieurs semaines à l'avance.",
    date: "2026-06-01",
  },
  {
    title: "Passeport : validité 6 mois",
    description:
      "Le Maroc exige un passeport valide 6 mois après la date d'entrée. Vérifiez votre passeport dès maintenant.",
    date: "2026-01-15",
  },
  {
    title: "Formalités douane véhicule",
    description:
      "Si vous voyagez avec votre véhicule, munissez-vous de la carte grise, de l'assurance et d'un permis de conduire valide.",
    date: "2026-03-10",
  },
  {
    title: "Aides au voyage MRE",
    description:
      "Le programme MRE de l'OFII propose des services d'accompagnement pour les Marocains résidant à l'étranger. Renseignez-vous sur vos droits.",
    date: "2026-02-20",
  },
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (character) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]!,
  );

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const pubDate = (date: string) => new Date(`${date}T12:00:00Z`).toUTCString();
  const items = newsItems
    .map(
      ({ title, description, date }) => `
        <item>
          <title>${escapeXml(title)}</title>
          <description>${escapeXml(description)}</description>
          <link>${origin}/guide</link>
          <guid isPermaLink="false">${origin}/rss.xml#${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</guid>
          <pubDate>${pubDate(date)}</pubDate>
        </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>RME Voyage — Infos voyage Europe ↔ Maroc</title>
    <description>Conseils et informations pratiques pour préparer un voyage entre l'Europe et le Maroc.</description>
    <link>${origin}</link>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
