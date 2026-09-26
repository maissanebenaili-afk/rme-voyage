// Image de partage par défaut. Une page qui redéfinit `openGraph` remplace
// l'objet du layout racine en entier : sans cette image explicite, elle
// n'avait plus d'aperçu sur WhatsApp, Facebook ou dans Google.
export const defaultOgImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'RME Voyage — Europe ↔ Maroc',
};
