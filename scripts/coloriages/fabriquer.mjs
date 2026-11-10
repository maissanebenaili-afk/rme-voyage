#!/usr/bin/env node
// Fabrique un livre de coloriage prêt à publier :
//   node scripts/coloriages/fabriquer.mjs            livre 1 « Coloriages du Maroc »
//   node scripts/coloriages/fabriquer.mjs nour       livre 2 « Coloriages de Nour, Joha et la fée »
// Écrit dans coloriages-livres/<livre>/ (hors Git, c'est le produit à vendre) :
//   interieur.pdf (8,5 × 11 pouces, noir et blanc), couverture-avant.png (2550 × 3300), apercu/*.png
// et dans public/coloriages/ (en ligne, gratuit) : un échantillon de 4 pages et des aperçus.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { PAGES, svgPage, rosace, etoile, CX } from './pages.mjs';
import { PAGES_PERSO, buste, avecFond } from './personnages.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Chaque livre : ses pages, son dossier, ses fichiers en ligne (noms conservés pour le livre 1) et ses aperçus.
const LIVRES = {
  maroc: { dossier: 'coloriages-du-maroc', titre: 'Coloriages du Maroc', marque: 'Coloriages du Maroc', pages: PAGES, titreCouv: ['COLORIAGES', 'DU MAROC'], sous: 'Zellige, rosaces, lanternes et thé à la menthe',
    echantillon: 'echantillon-coloriages-du-maroc.pdf', apercu: 'apercu-', couverture: 'couverture.png', choix: ['rosace-4', 'zellige-1', 'fanous-1', 'khamsa-1'], apercus: ['rosace-4', 'zellige-1', 'porte-1', 'fanous-1', 'theiere-1', 'verres-1', 'khamsa-1', 'rosace-2'] },
  nour: { dossier: 'coloriages-nour-joha-et-la-fee', titre: 'Coloriages de Nour, Joha et la fée', marque: 'Nour, Joha et la fée', pages: PAGES_PERSO, titreCouv: ['NOUR, JOHA', 'ET LA FÉE'], sous: 'Les héros des histoires RME Voyage à colorier',
    echantillon: 'echantillon-nour-joha-et-la-fee.pdf', apercu: 'apercu-nour-', couverture: 'couverture-nour.png', choix: ['nour', 'fee', 'lune', 'mandala-5'], apercus: ['nour', 'joha', 'nejma', 'lettre', 'lune', 'voiture', 'medina', 'mandala-5'] },
};
const cle = process.argv[2] ?? 'maroc';
const L = LIVRES[cle];
if (!L) throw new Error(`livre inconnu : ${cle} (choix : ${Object.keys(LIVRES).join(', ')})`);
const LIVRE = path.join(RACINE, 'coloriages-livres', L.dossier), PUBLIC = path.join(RACINE, 'public', 'coloriages');
mkdirSync(path.join(LIVRE, 'apercu'), { recursive: true }); mkdirSync(PUBLIC, { recursive: true });

const URL_PORTAIL = 'rme-voyage.netlify.app/coloriages';
const serif = "font-family=\"Georgia, 'DejaVu Serif', serif\"";
const enveloppe = (corps, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100" width="850" height="1100" fill="none" stroke="#111" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" ${extra}>${corps}</svg>`;
const cadre = '<rect x="25" y="25" width="800" height="1050" rx="22"/><rect x="42" y="42" width="766" height="1016" rx="14"/>';

const pageTitre = () => enveloppe(`${cadre}<g transform="translate(0 -40) scale(0.62) translate(260 330)">${rosace(12, 777)}</g>` +
  `<text x="${CX}" y="800" text-anchor="middle" font-size="${L.titre.length > 22 ? 42 : 64}" ${serif} stroke="none" fill="#111">${L.titre}</text>` +
  `<text x="${CX}" y="860" text-anchor="middle" font-size="28" ${serif} stroke="none" fill="#333">${L.sous}</text>` +
  `<text x="${CX}" y="990" text-anchor="middle" font-size="20" ${serif} stroke="none" fill="#555">© RME Voyage · Dessins originaux · Tous droits réservés</text>`);
const pageAppartient = () => enveloppe(`${cadre}<text x="${CX}" y="300" text-anchor="middle" font-size="44" ${serif} stroke="none" fill="#111">Ce livre appartient à</text>` +
  `<path d="M175 420H675"/><g transform="translate(${CX} 640)">${etoile(8, 110, 56) ? `<path d="${etoile(8, 110, 56)}"/>` : ''}<circle r="26"/></g>` +
  `<text x="${CX}" y="860" text-anchor="middle" font-size="26" ${serif} stroke="none" fill="#333">Astuce : commence par les petites zones,</text><text x="${CX}" y="900" text-anchor="middle" font-size="26" ${serif} stroke="none" fill="#333">termine par les grandes.</text>`);
const pageFin = () => enveloppe(`${cadre}<g transform="translate(${CX} 330)"><path d="${etoile(12, 150, 84)}"/><circle r="40"/><circle r="170"/></g>` +
  `<text x="${CX}" y="660" text-anchor="middle" font-size="54" ${serif} stroke="none" fill="#111">Merci d’avoir colorié !</text>` +
  `<text x="${CX}" y="730" text-anchor="middle" font-size="26" ${serif} stroke="none" fill="#333">Histoires à écouter sans réseau,</text><text x="${CX}" y="770" text-anchor="middle" font-size="26" ${serif} stroke="none" fill="#333">jeux et nouveaux coloriages :</text>` +
  `<text x="${CX}" y="835" text-anchor="middle" font-size="32" ${serif} stroke="none" fill="#111">${URL_PORTAIL}</text>`);

const personnagesCouverture = () => avecFond('#0f1f3d', () =>
  `<g transform="translate(170 708) scale(0.4)">${buste('nour')}</g><g transform="translate(655 727) scale(0.36)">${buste('nejma')}</g><g transform="translate(425 564) scale(0.62)">${buste('joha')}</g>`, '#e8c872');

const couverture = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 1100" width="850" height="1100">` +
  `<rect width="850" height="1100" fill="#0f1f3d"/><rect x="22" y="22" width="806" height="1056" rx="26" fill="none" stroke="#e8c872" stroke-width="5"/><rect x="42" y="42" width="766" height="1016" rx="16" fill="none" stroke="#e8c872" stroke-width="2"/>` +
  `<g transform="translate(425 590) scale(0.82)" fill="rgba(232,200,114,0.07)" stroke="#e8c872" stroke-width="3" stroke-linejoin="round">${rosace(12, 311).replace(/^<g[^>]*>|<\/g>$/g, '')}</g>` +
  (cle === 'nour' ? `<g fill="none" stroke="#e8c872" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${personnagesCouverture()}</g>`
    : `<circle cx="425" cy="590" r="34" fill="#0f6e5a" stroke="#e8c872" stroke-width="3"/><path d="${etoile(8, 52, 26)}" transform="translate(425 590)" fill="#e8c872" stroke="#0f1f3d" stroke-width="2"/>`) +
  `<text x="425" y="150" text-anchor="middle" font-size="86" font-weight="bold" ${serif} fill="#f4f1e8">${L.titreCouv[0]}</text><text x="425" y="238" text-anchor="middle" font-size="86" font-weight="bold" ${serif} fill="#f4f1e8">${L.titreCouv[1]}</text>` +
  `<text x="425" y="950" text-anchor="middle" font-size="30" ${serif} fill="#e8c872">${L.sous}</text>` +
  `<text x="425" y="993" text-anchor="middle" font-size="26" ${serif} fill="#f4f1e8">${L.pages.length} dessins à colorier · pour toute la famille</text>` +
  `<text x="425" y="1040" text-anchor="middle" font-size="24" font-weight="bold" ${serif} fill="#5fd1b0" letter-spacing="3">RME VOYAGE</text></svg>`;

const PAGES_LIVRE = L.pages;
const dessins = PAGES_LIVRE.map((p, i) => svgPage(p, i + 3, L.marque));
const toutes = [pageTitre(), pageAppartient(), ...dessins, pageFin()];
const html = (svgs) => `<!doctype html><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:0}html,body{margin:0;background:#fff}.p{width:8.5in;height:11in;page-break-after:always;overflow:hidden}.p svg{width:8.5in;height:11in;display:block}</style>${svgs.map((s) => `<div class="p">${s}</div>`).join('')}`;

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 850, height: 1100 } }); const page = await ctx.newPage();
const pdf = async (svgs, fichier) => { await page.setContent(html(svgs)); await page.pdf({ path: fichier, width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }); };
await pdf(toutes, path.join(LIVRE, 'interieur.pdf'));
// échantillon gratuit : 4 dessins + page de fin
const choix = L.choix.map((id) => dessins[PAGES_LIVRE.findIndex((p) => p.id === id)]);
await pdf([...choix, pageFin()], path.join(PUBLIC, L.echantillon));
// couverture avant (2550 × 3300) et aperçus
const grande = await nav.newContext({ viewport: { width: 850, height: 1100 }, deviceScaleFactor: 3 }); const pg = await grande.newPage();
await pg.setContent(`<body style="margin:0">${couverture()}</body>`); await pg.screenshot({ path: path.join(LIVRE, 'couverture-avant.png') });
const petite = await nav.newContext({ viewport: { width: 850, height: 1100 }, deviceScaleFactor: 0.5 }); const pp = await petite.newPage();
for (const id of L.apercus) { const i = PAGES_LIVRE.findIndex((p) => p.id === id); await pp.setContent(`<body style="margin:0;background:#fff">${dessins[i]}</body>`); await pp.screenshot({ path: path.join(PUBLIC, `${L.apercu}${id}.png`) }); }
await pp.setContent(`<body style="margin:0">${couverture()}</body>`); await pp.screenshot({ path: path.join(PUBLIC, L.couverture) });
await nav.close();
writeFileSync(path.join(LIVRE, 'LISEZ-MOI.txt'), `${L.titre} : ${toutes.length} pages, 8,5 x 11 pouces, noir et blanc.\nInterieur : interieur.pdf\nCouverture : couverture-avant.png (2550 x 3300)\n`);
console.log(`${L.titre} : ${toutes.length} pages (dont ${PAGES_LIVRE.length} dessins)`);
