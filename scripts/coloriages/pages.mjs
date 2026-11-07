// Pages de coloriage « Coloriages du Maroc » : dessins au trait générés par code (géométrie), 100 % originaux.
// Chaque page est un SVG 850 × 1100 (format 8,5 × 11 pouces, 100 unités par pouce), traits noirs, aucune surface pleine :
// les zones sont assez grandes pour des crayons de couleur. Rien n'est tiré d'une œuvre existante.

export const L = 850, H = 1100, CX = 425, CY = 535;
const f = (n) => +n.toFixed(2);
const rad = (d) => (d * Math.PI) / 180;

/** Petit générateur pseudo-aléatoire reproductible : une même graine donne toujours le même dessin. */
export function hasard(graine) {
  let s = graine >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const polygone = (pts) => `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
/** Étoile à n branches centrée en (0,0). */
export function etoile(n, R, r, rot = 0) {
  const pts = [];
  for (let k = 0; k < 2 * n; k++) { const a = rot + (k * Math.PI) / n - Math.PI / 2, q = k % 2 ? r : R; pts.push([q * Math.cos(a), q * Math.sin(a)]); }
  return polygone(pts);
}
const petale = (r0, r1, w) => `M${f(r0)} 0C${f(r0 + (r1 - r0) * 0.3)} ${f(-w)} ${f(r0 + (r1 - r0) * 0.7)} ${f(-w)} ${f(r1)} 0C${f(r0 + (r1 - r0) * 0.7)} ${f(w)} ${f(r0 + (r1 - r0) * 0.3)} ${f(w)} ${f(r0)} 0Z`;
const cercle = (r, x = 0, y = 0) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
const chemin = (d, t = '') => `<path d="${d}"${t ? ` transform="${t}"` : ''}/>`;
const arche = (x, y, w, h) => `M${x} ${y + h}L${x} ${f(y + w / 2)}A${f(w / 2)} ${f(w / 2)} 0 0 1 ${x + w} ${f(y + w / 2)}L${x + w} ${y + h}Z`;
/** Arche brisée (style mauresque) : base de largeur 2w, centre cx, épaule à ys, rayon R > w. */
function archeBrisee(cx, w, ys, yb, R) {
  const h = Math.sqrt(2 * R * w - w * w), x1 = cx - w, x2 = cx + w;
  return `M${f(x1)} ${yb}L${f(x1)} ${ys}A${f(R)} ${f(R)} 0 0 1 ${cx} ${f(ys - h)}A${f(R)} ${f(R)} 0 0 1 ${f(x2)} ${ys}L${f(x2)} ${yb}Z`;
}

/** Rosace à n branches : anneaux de pétales, d'étoiles et de perles, du bord vers le centre. */
export function rosace(n, graine) {
  const a = hasard(graine); let g = '', r = 360; g += cercle(r);
  while (r > 70) {
    const t = 38 + a() * 52, r1 = Math.max(r - t, 40), type = ['petale', 'etoile', 'perles', 'petale'][Math.floor(a() * 4)];
    const mid = (r + r1) / 2, larg = Math.max(11, Math.min(60, ((2 * Math.PI * r1) / n) * 0.42));
    if (type === 'petale') for (let i = 0; i < n; i++) g += chemin(petale(r1, r, larg), `rotate(${f((360 * i) / n + (a() < 0.5 ? 0 : 180 / n))})`);
    else if (type === 'etoile') g += chemin(etoile(n, r, r1 + (r - r1) * 0.25, rad(a() < 0.5 ? 0 : 180 / n)));
    else for (let i = 0; i < n; i++) g += cercle(Math.max(9, t * 0.22), mid * Math.cos(rad((360 * i) / n)), mid * Math.sin(rad((360 * i) / n)));
    g += cercle(r1); r = r1 - 14; if (r > 70) g += cercle(r);
  }
  g += chemin(etoile(n, Math.min(r + 6, 64), Math.min(r + 6, 64) * 0.5)) + cercle(12);
  return `<g transform="translate(${CX} ${CY})">${g}</g>`;
}

/** Pavage de zellige : étoiles à 8 branches et losanges décorés, sur un quadrillage entier (aucune coupe). */
export function zellige(variante) {
  const cfg = [{ s: 140, R: 0.5, r: 0.3, c: 5, l: 6 }, { s: 175, R: 0.5, r: 0.28, c: 4, l: 5 }, { s: 117, R: 0.5, r: 0.3, c: 6, l: 7 }, { s: 140, R: 0.48, r: 0.22, c: 5, l: 6 }, { s: 175, R: 0.5, r: 0.34, c: 4, l: 5 }, { s: 117, R: 0.46, r: 0.26, c: 6, l: 7 }][variante % 6];
  const x0 = CX - (cfg.c * cfg.s) / 2, y0 = 590 - (cfg.l * cfg.s) / 2; let g = '';
  for (let i = 0; i < cfg.c; i++) for (let j = 0; j < cfg.l; j++) {
    const x = x0 + (i + 0.5) * cfg.s, y = y0 + (j + 0.5) * cfg.s;
    g += `<g transform="translate(${f(x)} ${f(y)})">${chemin(etoile(8, cfg.s * cfg.R * 0.96, cfg.s * cfg.r))}${cercle(cfg.s * 0.09)}${variante % 2 ? chemin(etoile(8, cfg.s * cfg.r * 0.8, cfg.s * cfg.r * 0.4, rad(22.5))) : ''}</g>`;
    if (i < cfg.c - 1 && j < cfg.l - 1) { const dx = cfg.s * 0.5, d = cfg.s * 0.3; g += `<g transform="translate(${f(x + dx)} ${f(y + dx)})">${chemin(polygone([[0, -d], [d, 0], [0, d], [-d, 0]]))}${cercle(d * 0.3)}</g>`; }
  }
  g += `<rect x="${f(x0)}" y="${f(y0)}" width="${cfg.c * cfg.s}" height="${cfg.l * cfg.s}" rx="6"/>`;
  return g;
}

/** Porte à arches mauresques emboîtées, frise d'étoiles et rosace dans le tympan. */
export function porte(variante) {
  let g = ''; const base = [270, 258, 282][variante % 3], R = base * 1.55;
  for (let k = 0; k < 4; k++) g += chemin(archeBrisee(CX, base - k * 38, 560 + k * 4, 960, R - k * 40));
  if (variante % 3 === 0) g += `<g transform="translate(${CX} 480)">${chemin(etoile(8, 78, 40))}${cercle(18)}${cercle(92)}</g>`;
  else if (variante % 3 === 1) g += `<g transform="translate(${CX} 480)">${chemin(etoile(12, 96, 62))}${cercle(40)}${cercle(112)}${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => cercle(7, 128 * Math.cos(rad(k * 45)), 128 * Math.sin(rad(k * 45)))).join('')}</g>`;
  else for (const [dx, dy, r] of [[-70, 520, 44], [70, 520, 44], [0, 440, 52]]) g += `<g transform="translate(${CX + dx} ${dy})">${chemin(etoile(6, r, r * 0.55))}${cercle(r * 1.25)}</g>`;
  for (let i = 0; i < 5; i++) g += `<g transform="translate(${f(CX + (i - 2) * 66)} 905)">${chemin(etoile(8, 24, 13))}${cercle(4)}</g>`;
  g += `<path d="M${CX} 640V870"/>`;
  if (variante % 3 === 1) g += `<path d="M${CX - 150} 760H${CX + 150}"/>`;
  if (variante % 3 === 2) for (const s of [-1, 1]) g += `<g transform="translate(${CX + s * 100} 760)">${chemin(etoile(8, 34, 18))}${cercle(7)}</g>`;
  else for (const s of [-1, 1]) for (let j = 0; j < 5; j++) g += cercle(7, CX + s * 70, 690 + j * 42);
  g += cercle(16, CX - 26, 790) + cercle(16, CX + 26, 790);
  g += `<rect x="${CX - base}" y="960" width="${base * 2}" height="40" rx="4"/>`;
  for (const s of [-1, 1]) for (let j = 0; j < 4; j++) g += `<g transform="translate(${f(CX + s * (base - 57))} ${690 + j * 56})">${chemin(polygone([[0, -13], [13, 0], [0, 13], [-13, 0]]))}</g>`;
  return g;
}

/** Lanterne marocaine (fanous) : coupole, fenêtres en arche ou en losange, base et gland. */
export function fanous(variante) {
  let g = cercle(22, CX, 150) + `<path d="M${CX} 172V232"/>` + chemin(`M${CX - 95} 330C${CX - 65} 262 ${CX - 25} 236 ${CX} 232C${CX + 25} 236 ${CX + 65} 262 ${CX + 95} 330Z`);
  g += `<rect x="${CX - 105}" y="330" width="210" height="30" rx="8"/>`;
  g += chemin(`M${CX - 105} 360C${CX - 150} 520 ${CX - 150} 700 ${CX - 105} 860H${CX + 105}C${CX + 150} 700 ${CX + 150} 520 ${CX + 105} 360Z`);
  const w = 58, xs = [CX - 99, CX - 29, CX + 41];
  for (const x of xs) {
    for (const [y, h] of [[405, 190], [640, 175]]) g += variante === 2 ? cercle(w / 2 - 2, x + w / 2, y + h / 2 - 20) + cercle(w / 2 - 14, x + w / 2, y + h / 2 - 20) : variante === 1 ? chemin(polygone([[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]])) : chemin(arche(x, y, w, h));
    g += `<g transform="translate(${x + w / 2} 640)">${chemin(etoile(8, 20, 10))}</g><g transform="translate(${x + w / 2} 505)">${cercle(9)}</g>`;
  }
  g += `<rect x="${CX - 105}" y="860" width="210" height="26" rx="8"/>` + chemin(polygone([[CX - 105, 886], [CX + 105, 886], [CX + 70, 960], [CX - 70, 960]]));
  g += cercle(18, CX, 985) + `<path d="M${CX - 24} 1003L${CX - 34} 1040M${CX} 1003V1044M${CX + 24} 1003L${CX + 34} 1040"/>`;
  for (const [x, y, r] of [[160, 300, 36], [690, 380, 30], [150, 700, 28], [700, 760, 40], [180, 930, 30], [680, 980, 26]]) g += `<g transform="translate(${x} ${y})">${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.18)}</g>`;
  return `<g transform="translate(${CX} 178) scale(0.9) translate(${-CX} -150)">${g}</g>`;
}

/** Théière marocaine, plateau et petites étoiles. */
export function theiere(variante = 0) {
  let g = chemin('M300 640C290 520 360 470 425 470C490 470 560 520 550 640C545 740 500 790 425 790C350 790 305 740 300 640Z');
  g += chemin('M365 478C375 440 475 440 485 478Z') + cercle(16, 425, 428) + chemin('M548 590C620 560 640 520 690 480L712 504C668 552 640 620 548 664Z');
  g += chemin('M302 566C190 520 170 740 304 726C238 704 236 592 302 566Z') + chemin('M355 790H495L485 822H365Z');
  g += `<ellipse cx="${CX}" cy="860" rx="330" ry="62"/><ellipse cx="${CX}" cy="860" rx="290" ry="40"/>`;
  if (variante === 0) {
    g += `<g transform="translate(${CX} 635)">${chemin(etoile(8, 54, 26))}${cercle(13)}${cercle(68)}</g>`;
    g += '<path d="M312 548C380 588 470 588 538 548M306 722C380 762 470 762 544 722"/>';
    for (let i = 0; i < 6; i++) g += cercle(7, 345 + i * 32, 580 + Math.sin(i * 1.05) * 6);
  } else {
    g += `<g transform="translate(${CX} 640)">${[0, 1, 2, 3, 4, 5].map((k) => chemin(petale(18, 70, 20), `rotate(${k * 60})`)).join('')}${cercle(16)}</g>`;
    g += `<path d="M308 560L338 540L368 560L398 540L428 560L458 540L488 560L518 540L542 556M308 736L338 716L368 736L398 716L428 736L458 716L488 736L518 716L542 732"/>`;
    for (let k = 0; k < 3; k++) g += chemin(`M${560 + k * 50} 760C${548 + k * 50} 720 ${580 + k * 50} 690 ${606 + k * 50} 700C${612 + k * 50} 730 ${590 + k * 50} 756 ${560 + k * 50} 760Z`);
  }
  for (const [x, y, r] of [[170, 360, 38], [700, 330, 44], [160, 600, 30], [720, 700, 32], [210, 960, 34], [650, 970, 40]].filter(([x]) => !(variante === 1 && x === 720))) g += `<g transform="translate(${x} ${y})">${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.2)}</g>`;
  return g;
}

/** Trois verres à thé à la menthe sur un plateau, avec des feuilles de menthe. */
export function verres() {
  let g = `<ellipse cx="${CX}" cy="820" rx="350" ry="80"/><ellipse cx="${CX}" cy="820" rx="300" ry="54"/>`;
  const verre = (x, y, w, h) => chemin(`M${x} ${y}H${x + w}L${f(x + w * 0.84)} ${y + h}Q${f(x + w / 2)} ${y + h + 18} ${f(x + w * 0.16)} ${y + h}Z`) + `<path d="M${x + 2} ${y + 40}H${x + w - 2}M${f(x + w * 0.04)} ${y + h * 0.7}H${f(x + w * 0.96)}"/>`;
  for (const [x, y] of [[255, 565], [375, 545], [495, 565]]) {
    g += verre(x, y, 100, 230);
    for (let i = 0; i < 4; i++) g += `<g transform="translate(${x + 20 + i * 20} ${y + 56})">${chemin(polygone([[0, -10], [9, 0], [0, 10], [-9, 0]]))}</g>`;
    g += chemin(`M${x + 50} ${y}C${x + 20} ${y - 70} ${x + 60} ${y - 110} ${x + 90} ${y - 80}C${x + 100} ${y - 40} ${x + 80} ${y - 10} ${x + 50} ${y}Z`) + `<path d="M${x + 50} ${y}L${x + 78} ${y - 70}"/>`;
  }
  for (const [x, y, r] of [[170, 300, 40], [690, 280, 46], [175, 980, 34], [670, 990, 38]]) g += `<g transform="translate(${x} ${y})">${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.2)}</g>`;
  g += `<g transform="translate(${CX} 280)">${chemin(etoile(12, 100, 60))}${cercle(30)}</g>`;
  return g;
}

/** Khamsa (main de Fatma) symétrique, œil au centre, étoiles dans les doigts. */
export function khamsa(variante = 0) {
  let g = chemin('M425 880C340 880 285 845 272 775C260 710 205 680 160 590C146 558 182 528 212 552C245 578 270 610 300 640L300 330C300 290 370 290 370 330L370 470C370 478 390 478 390 470L390 270C390 225 460 225 460 270L460 470C460 478 480 478 480 470L480 330C480 290 550 290 550 330L550 640C580 610 605 578 638 552C668 528 704 558 690 590C645 680 590 710 578 775C565 845 510 880 425 880Z');
  if (variante === 0) {
    g += `<path d="M345 640Q425 560 505 640Q425 720 345 640Z"/>${cercle(34, CX, 640)}${cercle(14, CX, 640)}`;
    g += '<path d="M360 580Q425 520 490 580M375 560L365 530M425 540V508M475 560L485 530"/>';
    for (const [x, y, r] of [[335, 400, 22], [425, 360, 24], [515, 400, 22]]) g += `<g transform="translate(${x} ${y})">${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.2)}</g>`;
    for (const [x, y] of [[335, 460], [425, 440], [515, 460]]) g += cercle(7, x, y);
    g += '<path d="M330 780C380 810 470 810 520 780M345 820C390 845 460 845 505 820"/>';
  } else {
    g += `<g transform="translate(${CX} 650)">${chemin(etoile(12, 78, 50))}${cercle(34)}${cercle(88)}</g>`;
    for (const [x, y] of [[335, 395], [425, 350], [515, 395]]) g += `<g transform="translate(${x} ${y})">${[0, 1, 2, 3, 4].map((k) => chemin(petale(6, 26, 8), `rotate(${k * 72})`)).join('')}${cercle(5)}</g>`;
    g += '<path d="M335 440V500M425 395V500M515 440V500"/>';
    for (let k = 0; k < 5; k++) g += chemin(`M${340 + k * 36} 790Q${358 + k * 36} 760 ${376 + k * 36} 790`);
  }
  for (const [x, y, r] of [[190, 330, 36], [660, 330, 36], [170, 860, 30], [680, 860, 30]]) g += `<g transform="translate(${x} ${y})">${chemin(etoile(8, r, r * 0.5))}${cercle(r * 0.2)}</g>`;
  return g;
}

const cadre = (titre, n) => `<rect x="25" y="25" width="800" height="1050" rx="22"/><rect x="42" y="42" width="766" height="1016" rx="14"/>` +
  `<text x="${CX}" y="118" text-anchor="middle" font-size="46" font-family="Georgia, 'DejaVu Serif', serif" stroke="none" fill="#111">${titre}</text>` +
  `<path d="M${CX - 130} 140H${CX + 130}"/><text x="${CX}" y="1038" text-anchor="middle" font-size="19" font-family="Georgia, 'DejaVu Serif', serif" stroke="none" fill="#444">RME Voyage · Coloriages du Maroc · ${n}</text>`;

const VILLES = ['Fès', 'Marrakech', 'Meknès', 'Chefchaouen', 'Tétouan', 'Rabat', 'Tanger', 'Taza'];
const N_ROSACE = [12, 8, 10, 16, 12, 8, 10, 12];
export const PAGES = [
  ...VILLES.map((v, i) => ({ id: `rosace-${i + 1}`, titre: `Rosace de ${v}`, dessin: () => rosace(N_ROSACE[i], 101 + i * 37) })),
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ id: `zellige-${i + 1}`, titre: `Zellige, motif ${i + 1}`, dessin: () => zellige(i) })),
  ...[0, 1, 2].map((i) => ({ id: `porte-${i + 1}`, titre: ['La porte de la médina', 'L’arche du riad', 'La grande porte'][i], dessin: () => porte(i) })),
  ...[0, 1, 2].map((i) => ({ id: `fanous-${i + 1}`, titre: ['La lanterne', 'La lanterne aux losanges', 'La lanterne du soir'][i], dessin: () => fanous(i) })),
  { id: 'theiere-1', titre: 'La théière du goûter', dessin: () => theiere(0) },
  { id: 'theiere-2', titre: 'Le plateau de thé', dessin: () => theiere(1) },
  { id: 'verres-1', titre: 'Le thé à la menthe', dessin: verres },
  { id: 'khamsa-1', titre: 'La khamsa porte-bonheur', dessin: () => khamsa(0) },
  { id: 'khamsa-2', titre: 'La main aux fleurs', dessin: () => khamsa(1) },
];

/** SVG complet d'une page (numérotée à partir de 1). */
export function svgPage(p, n) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" fill="none" stroke="#111" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round">${cadre(p.titre, n)}${p.dessin()}</svg>`;
}
