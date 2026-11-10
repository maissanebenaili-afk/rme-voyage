// Livre 2 : « Coloriages de Nour, Joha et la fée ». Personnages et scènes des séries RME, dessinés au trait par code.
// Tout est original : aucun personnage, lieu ou musique n'est repris d'une œuvre existante.
import { CX, etoile, rosace, hasard, polygone, petale, cercle, chemin, archeBrisee } from './pages.mjs';

let FOND = '#fff', ENCRE = '#111';
/** Appelle `fn` avec une autre couleur de remplissage (la couverture utilise le bleu nuit au lieu du blanc). */
export const avecFond = (couleur, fn, encre = '#111') => { const [a, e] = [FOND, ENCRE]; FOND = couleur; ENCRE = encre; try { return fn(); } finally { FOND = a; ENCRE = e; } };
const f = (n) => +n.toFixed(2);
const P = (d, plus = '') => `<path d="${d}" fill="${FOND}" ${plus}/>`; // forme pleine : cache ce qui est derrière
const T = (d) => `<path d="${d}"/>`; // simple trait
const E = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${FOND}"/>`;
const R = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${FOND}"/>`;
const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${FOND}"/>`;
const G = (x, y, s, corps) => `<g transform="translate(${x} ${y}) scale(${s})">${corps}</g>`;
const ET = (x, y, r) => G(x, y, 1, `${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.2)}`);

const oeil = (x, y, r, cils) => `${E(x, y, r, r * 1.05)}${C(x, y + r * 0.1, r * 0.62)}<circle cx="${x}" cy="${y + r * 0.1}" r="${f(r * 0.3)}" fill="${ENCRE}"/>${C(x - r * 0.18, y - r * 0.12, r * 0.13)}` + (cils ? T(`M${x + Math.sign(x) * r} ${y - r * 0.4}l${Math.sign(x) * 14} -10M${x + Math.sign(x) * r} ${y}l${Math.sign(x) * 16} -2`) : '');
const sourcils = (y, epais = false) => T(`M-88 ${y}Q-56 ${y - 22} -22 ${y - 4}M88 ${y}Q56 ${y - 22} 22 ${y - 4}`) + (epais ? T(`M-88 ${y + 6}Q-56 ${y - 16} -22 ${y + 2}M88 ${y + 6}Q56 ${y - 16} 22 ${y + 2}`) : '');
const visage = ({ r = 28, cils = false, vieux = false, ouvert = false } = {}) => oeil(-54, 6, r, cils) + oeil(54, 6, r, cils) + sourcils(-34, vieux) + T('M-7 52Q0 64 7 52') +
  (ouvert ? P('M-36 86Q0 138 36 86Z') + T('M-20 100Q0 120 20 100') : T('M-32 88Q0 116 32 88')) + (vieux ? T('M-88 0l-14 -8M-90 10l-16 2M-88 20l-14 8M88 0l14 -8M90 10l16 2M88 20l14 8M-34 -74Q0 -84 34 -74') : cercle(17, -80, 62) + cercle(17, 80, 62));
const tete = () => `<ellipse cx="0" cy="0" rx="128" ry="148" fill="${FOND}"/>`;
const epaules = (col = 'v') => P('M-46 120L-46 192C-150 206 -250 250 -285 380L-285 480L285 480L285 380C250 250 150 206 46 192L46 120Z') +
  (col === 'v' ? T('M-46 192L0 280L46 192') + cercle(8, 0, 330) + cercle(8, 0, 380) + cercle(8, 0, 430) : col === 'rond' ? T('M-62 196Q0 262 62 196') : T('M-50 194Q0 240 50 194')) ;

const CHEVEUX = {
  bob: { dos: () => P('M-150 -20C-190 -230 190 -230 150 -20L158 130Q150 170 110 170L-110 170Q-150 170 -158 130Z'), face: () => P('M-135 -40C-110 -135 110 -135 135 -40C100 -85 40 -70 0 -95C-40 -70 -100 -85 -135 -40Z') + T('M-60 -105Q-52 -85 -58 -72M30 -108Q42 -88 36 -74') + P('M-128 -110C-170 -150 -190 -100 -150 -80C-130 -90 -118 -100 -128 -110ZM-128 -110C-90 -140 -80 -80 -128 -85Z') },
  pic: { dos: () => '', face: () => P('M-140 -30C-176 -110 -140 -190 -70 -184C-60 -226 20 -232 40 -190C100 -222 170 -150 140 -30C100 -92 -100 -92 -140 -30Z') + T('M-100 -120C-70 -150 -40 -150 -26 -120M-10 -150C10 -176 50 -170 60 -140M70 -118C90 -140 120 -134 124 -108') },
  turban: { dos: () => '', face: () => P('M-140 -40C-160 -250 160 -250 140 -40C90 -80 -90 -80 -140 -40Z') + T('M-139 -52C-60 -104 60 -104 139 -52M-134 -94C-50 -150 50 -150 134 -94M-118 -136C-40 -190 40 -190 118 -136M-84 -176C-30 -214 30 -214 84 -176') + cercle(14, 0, -208) + P('M120 -76C172 -56 178 22 150 64L128 44C150 12 146 -30 108 -58Z') },
  long: { dos: () => P('M-150 -30C-200 -220 200 -220 150 -30C190 120 180 260 150 350L-150 350C-180 260 -190 120 -150 -30Z'), face: () => T('M0 -146C-60 -122 -120 -82 -136 -30M0 -146C60 -122 120 -82 136 -30') + T('M-100 40C-120 120 -118 220 -108 300M100 40C120 120 118 220 108 300') + G(-96, -112, 1, `${chemin(etoile(5, 26, 11))}`) },
  voile: { dos: () => P('M-168 -10C-178 -236 178 -236 168 -10C192 150 204 300 220 480L-220 480C-204 300 -192 150 -168 -10Z'), face: () => P('M-142 -20C-140 -120 140 -120 142 -20C120 -60 -120 -60 -142 -20Z') + T('M-160 -10C-150 -150 150 -150 160 -10') },
};
const BARBE = () => P('M-125 40C-135 150 -60 212 0 216C60 212 135 150 125 40C100 100 60 124 0 124C-60 124 -100 100 -125 40Z') + P('M0 80C-20 58 -52 60 -66 82C-44 96 -16 92 0 84ZM0 80C20 58 52 60 66 82C44 96 16 92 0 84Z') + T('M-60 150Q-30 175 0 160M60 150Q30 175 0 160');

/** Buste d'un personnage centré en (0,0), sur fond blanc (ou bleu nuit pour la couverture). */
export function buste(id) {
  const aile = (s) => `<g transform="scale(${s} 1)">` + P('M-90 130C-240 60 -390 -30 -410 -170C-420 -300 -270 -310 -200 -210C-150 -140 -115 -60 -90 20Z') + P('M-80 210C-210 240 -320 180 -310 100C-250 66 -160 96 -80 150Z') + T('M-110 90C-210 30 -320 -50 -360 -170M-110 70C-200 10 -270 -40 -310 -120M-100 190C-190 200 -250 160 -280 110') + '</g>';
  const ail = aile(1) + aile(-1);
  switch (id) {
    case 'nour': return CHEVEUX.bob.dos() + epaules('v') + tete() + visage({ r: 30, cils: true, ouvert: true }) + CHEVEUX.bob.face() + T('M-98 -66C-60 -88 60 -88 98 -66');
    case 'yacine': return epaules('rond') + tete() + visage({ r: 32, ouvert: true }) + CHEVEUX.pic.face() + ET(0, 360, 50) + cercle(5, -40, 262) + cercle(5, 40, 262);
    case 'joha': return epaules('rond') + tete() + BARBE() + visage({ r: 21, vieux: true }).replace(/<path d="M-32 88Q0 116 32 88"\/>/, '') + CHEVEUX.turban.face() + T('M-26 110Q0 128 26 110') + T('M0 300V480') + ET(-170, 420, 24) + ET(170, 420, 24);
    case 'nejma': return ail + CHEVEUX.long.dos() + epaules('rond') + tete() + visage({ r: 30, cils: true }) + CHEVEUX.long.face() + Array.from({ length: 11 }, (_, k) => cercle(7, 70 * Math.cos(rad(40 + k * 10.0)), 195 + 60 * Math.sin(rad(40 + k * 10)) )).join('') + ET(-150, 380, 42) + ET(150, 380, 42) + ET(0, 400, 34);
    case 'zahra': return CHEVEUX.voile.dos() + epaules('rond') + tete() + visage({ r: 20, vieux: true }) + CHEVEUX.voile.face() + Array.from({ length: 5 }, (_, k) => ET(-160 + k * 80, 420, 24)).join('') + T('M-190 330C-120 390 120 390 190 330');
    default: throw new Error(`personnage inconnu : ${id}`);
  }
}
const rad = (d) => (d * Math.PI) / 180;

/** Médaillon : arche mauresque, halo décoratif derrière le buste, socle. */
export function portrait(id) {
  const w = 300, ys = 520, ext = archeBrisee(CX, w, ys, 1000, 354), int = archeBrisee(CX, w - 26, ys, 1000, 330);
  const halo = [190, 222, 254].map((r) => cercle(r, CX, 520)).join('') + Array.from({ length: 16 }, (_, k) => G(CX + 288 * Math.cos(rad(k * 22.5 - 90)), 520 + 288 * Math.sin(rad(k * 22.5 - 90)), 1, chemin(etoile(6, 14, 7)))).join('');
  return `<defs><clipPath id="clip-${id}"><path d="${int}"/></clipPath></defs><path d="${ext}"/><path d="${int}"/>` +
    `<g clip-path="url(#clip-${id})">${halo}<g transform="translate(${CX} ${id === 'nejma' ? 590 : 520}) scale(${id === 'nejma' ? 0.66 : 1})">${buste(id)}</g></g><rect x="${CX - w - 20}" y="1000" width="${2 * w + 40}" height="22" rx="6"/>`;
}

export function scene(nom) {
  switch (nom) {
    case 'lettre': {
      const bras = `${E(300, 880, 44, 36)}${E(550, 880, 44, 36)}`;
      return `<g transform="translate(${CX} 520) scale(0.78)">${buste('nour')}</g>` + bras + R(285, 780, 280, 190, 10) + T('M285 780L425 890L565 780M285 970L395 870M565 970L455 870') + R(480, 796, 62, 76, 4) + ET(511, 834, 20) + T('M310 800H400M310 818H380') +
        [[120, 230, 30], [330, 215, 22], [520, 215, 26], [730, 230, 32], [220, 330, 18], [640, 330, 20]].map(([x, y, r]) => ET(x, y, r)).join('') + [[130, 560, 30], [720, 560, 30], [120, 880, 26], [735, 880, 26]].map(([x, y, r]) => ET(x, y, r)).join('');
    }
    case 'lune': {
      const lune = cercle(170, CX, 410) + cercle(34, 360, 360) + cercle(22, 470, 330) + cercle(44, 500, 450) + cercle(18, 390, 470) + cercle(26, 450, 520);
      const puits = R(540, 800, 230, 150, 6) + E(655, 800, 115, 34) + `<ellipse cx="655" cy="800" rx="82" ry="20"/>` + cercle(14, 655, 802) + T('M560 800V740M750 800V740M560 740H750') + R(610, 700, 90, 40, 6);
      const etoiles = [[120, 250, 30], [740, 240, 34], [130, 520, 24], [730, 560, 28], [210, 330, 18], [650, 330, 20]].map(([x, y, r]) => ET(x, y, r)).join('');
      return lune + etoiles + puits + `<g transform="translate(235 725) scale(0.52)">${buste('joha')}</g>`;
    }
    case 'fee': {
      const etoiles = [[110, 230, 34], [740, 230, 40], [260, 215, 18], [600, 215, 20], [425, 205, 24], [90, 900, 34], [740, 900, 38]].map(([x, y, r]) => ET(x, y, r)).join('');
      return etoiles + `<g transform="translate(${CX} 600) scale(0.82)">${buste('nejma')}</g>`;
    }
    case 'voiture': {
      const soleil = cercle(46, 680, 270) + Array.from({ length: 12 }, (_, k) => T(`M${680 + 64 * Math.cos(rad(k * 30))} ${270 + 64 * Math.sin(rad(k * 30))}L${680 + 92 * Math.cos(rad(k * 30))} ${270 + 92 * Math.sin(rad(k * 30))}`)).join('');
      const mont = P('M150 520L260 350L340 440L430 320L550 460L630 390L780 520Z');
      const voit = P('M170 780L170 720Q175 700 200 696L290 688Q330 620 400 610L520 610Q580 615 610 680L660 692Q690 700 690 730L690 780Z') + P('M300 684Q335 632 395 628L395 684Z') + P('M415 628L515 628Q560 632 585 684L415 684Z') + cercle(12, 672, 724) + T('M470 700H510M360 700H390') + C(260, 792, 46) + cercle(26, 260, 792) + C(590, 792, 46) + cercle(26, 590, 792) + G(260, 792, 1, chemin(etoile(8, 20, 10))) + G(590, 792, 1, chemin(etoile(8, 20, 10)));
      const bagages = R(280, 560, 110, 52, 8) + T('M335 560V612') + R(410, 570, 90, 42, 8) + T('M455 570V612') + P('M520 600C520 570 560 570 560 600Z') + T('M300 560V548H370V560');
      const route = T('M60 850H790') + [90, 200, 310, 420, 530, 640].map((x) => R(x, 880, 70, 14, 5)).join('') + T('M60 930H790');
      const palmier = T('M100 850C96 780 104 700 115 640') + T('M115 640C80 625 60 640 48 668M115 640C85 610 78 590 86 565M115 640C150 625 170 640 182 668M115 640C145 610 152 590 144 565M115 640C115 610 118 585 126 560');
      const visages = G(350, 662, 1, `${cercle(20)}${cercle(3, -7, -3)}${cercle(3, 7, -3)}${T('M-8 8Q0 14 8 8')}`) + G(470, 662, 1, `${cercle(20)}${cercle(3, -7, -3)}${cercle(3, 7, -3)}${T('M-8 8Q0 14 8 8')}`);
      const nuages = T('M120 290C100 290 90 270 110 262C110 236 150 232 160 252C180 238 210 256 200 276C220 280 220 300 196 300Z') + T('M420 220C400 220 392 202 410 196C410 174 446 170 454 188C472 176 498 192 490 210C508 214 508 232 486 232Z');
      return soleil + mont + palmier + nuages + bagages + voit + visages + route;
    }
    case 'bateau': {
      const coque = P('M130 760L720 760L650 880L210 880Z') + T('M170 800H680M190 840H660');
      const cabines = R(260, 650, 340, 110, 8) + R(340, 560, 180, 90, 8) + R(400, 470, 62, 90, 6) + T('M400 500H462M400 530H462') + T('M431 470V420') + P('M431 420L500 438L431 456Z') +
        [290, 350, 410, 470, 530].map((x) => cercle(18, x, 705)).join('') + [370, 430, 490].map((x) => cercle(15, x, 605)).join('');
      const vagues = [920, 960, 1000].map((y) => T(`M75 ${y}q25 -34 50 0${' t50 0'.repeat(13)}`)).join('');
      const soleil = cercle(54, 670, 280) + Array.from({ length: 10 }, (_, k) => T(`M${670 + 70 * Math.cos(rad(k * 36))} ${280 + 70 * Math.sin(rad(k * 36))}L${670 + 104 * Math.cos(rad(k * 36))} ${280 + 104 * Math.sin(rad(k * 36))}`)).join('');
      const oiseaux = T('M150 330q22 -26 44 0q22 -26 44 0M260 250q18 -22 36 0q18 -22 36 0M420 330q18 -22 36 0q18 -22 36 0');
      return soleil + oiseaux + cabines + coque + vagues + ET(150, 640, 30) + ET(720, 700, 30);
    }
    case 'cedres': {
      const cedre = (x, s) => G(x, 870 - 70 * s, s, T('M0 0V70') + [0, 1, 2, 3].map((k) => P(`M${-100 + k * 18} ${-k * 56}Q0 ${-k * 56 - 44} ${100 - k * 18} ${-k * 56}Q0 ${-k * 56 + 26} ${-100 + k * 18} ${-k * 56}Z`)).join('') + P('M-40 -224Q0 -272 40 -224Q0 -206 -40 -224Z'));
      const neige = P('M80 520L250 330L370 450L500 290L720 520Z') + ET(130, 230, 30) + ET(720, 250, 36);
      return neige + cedre(150, 0.7) + cedre(330, 0.9) + cedre(540, 0.8) + cedre(710, 0.85) + T('M70 870H790') + Array.from({ length: 6 }, (_, k) => ET(150 + k * 110, 950, 26)).join('') + T('M70 1010H790');
    }
    case 'medina': {
      const minaret = R(380, 360, 90, 400, 4) + [0, 1, 2, 3].map((k) => R(394, 390 + k * 90, 62, 62, 4) + ET(425, 421 + k * 90, 22)).join('') + P('M370 360H480V330H370Z') + R(395, 275, 60, 55, 4) + P('M395 275Q425 210 455 275Z') + T('M425 210V190') + cercle(9, 425, 181);
      const maison = (x, w, h) => R(x, 760 - h, w, h, 4) + P(`M${x + w * 0.3} 760V${760 - h * 0.5}A${w * 0.2} ${w * 0.2} 0 0 1 ${x + w * 0.7} ${760 - h * 0.5}V760Z`) + cercle(w * 0.08, x + w * 0.5, 760 - h * 0.8);
      const chat = `<g transform="translate(-290 0)">` + P('M610 760C590 740 590 700 620 690C640 686 660 700 660 730V760Z') + C(630, 664, 22) + P('M612 648L608 624L626 640ZM648 648L652 624L634 640Z') + cercle(3, 622, 662) + cercle(3, 638, 662) + T('M610 740C575 735 565 705 580 685') + '</g>';
      const lune = T('M690 230a56 56 0 1 0 44 84a44 44 0 1 1 -44 -84Z');
      return minaret + maison(90, 180, 220) + maison(500, 200, 190) + maison(720, 80, 150) + chat + lune + ET(580, 250, 22) + T('M70 760H790') + Array.from({ length: 6 }, (_, k) => ET(150 + k * 110, 860, 26)).join('') + T('M70 920H790');
    }
    case 'portrait': {
      const w = 300, ext = archeBrisee(CX, w, 520, 1000, 354), int = archeBrisee(CX, w - 26, 520, 1000, 330);
      return `<path d="${ext}"/><path d="${int}"/>` + Array.from({ length: 16 }, (_, k) => G(CX + 215 * Math.cos(rad(k * 22.5 - 90)), 560 + 215 * Math.sin(rad(k * 22.5 - 90)), 1, chemin(etoile(6, 16, 8)))).join('') +
        `<text x="${CX}" y="548" text-anchor="middle" font-size="30" font-family="Georgia, 'DejaVu Serif', serif" stroke="none" fill="#555">Dessine ton</text><text x="${CX}" y="590" text-anchor="middle" font-size="30" font-family="Georgia, 'DejaVu Serif', serif" stroke="none" fill="#555">portrait ici</text><rect x="${CX - w - 20}" y="1000" width="${2 * w + 40}" height="22" rx="6"/>`;
    }
    default: throw new Error(`scène inconnue : ${nom}`);
  }
}

const TITRES = ['Mandala de l’aube', 'Mandala du matin', 'Mandala des dunes', 'Mandala du thé', 'Mandala des étoiles', 'Mandala de la lune', 'Mandala du soir', 'Mandala de la nuit', 'Mandala du bled', 'Mandala de la route', 'Mandala du retour', 'Mandala de la famille'];
const N_MANDALA = [6, 7, 9, 11, 14, 18, 20, 24, 6, 9, 14, 18];
export const PAGES_PERSO = [
  { id: 'nour', titre: 'Nour', dessin: () => portrait('nour') },
  { id: 'yacine', titre: 'Yacine', dessin: () => portrait('yacine') },
  { id: 'joha', titre: 'Joha le malicieux', dessin: () => portrait('joha') },
  { id: 'nejma', titre: 'Lalla Nejma, la bonne fée', dessin: () => portrait('nejma') },
  { id: 'zahra', titre: 'Lalla Zahra', dessin: () => portrait('zahra') },
  { id: 'lettre', titre: 'Nour et la lettre', dessin: () => scene('lettre') },
  { id: 'lune', titre: 'Joha et la lune dans le puits', dessin: () => scene('lune') },
  { id: 'fee', titre: 'La fée et la pluie d’étoiles', dessin: () => scene('fee') },
  { id: 'voiture', titre: 'En route vers le Maroc', dessin: () => scene('voiture') },
  { id: 'bateau', titre: 'Le grand bateau', dessin: () => scene('bateau') },
  { id: 'cedres', titre: 'Les cèdres de l’Atlas', dessin: () => scene('cedres') },
  { id: 'medina', titre: 'La médina au soleil', dessin: () => scene('medina') },
  ...TITRES.map((t, i) => ({ id: `mandala-${i + 1}`, titre: t, dessin: () => rosace(N_MANDALA[i], 4000 + i * 53) })),
  { id: 'portrait', titre: 'À toi de dessiner !', dessin: () => scene('portrait') },
];
export { hasard, polygone, petale };
