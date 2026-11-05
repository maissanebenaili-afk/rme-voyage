// Moteur d'images du feuilleton « Le Fil d'or » (navigateur, canvas 1080 × 1920).
// Chargé par page.html. Expose window.ADOS.{init, frame}.
(function () {
  const W = 1080, H = 1920;
  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  cv.width = W; cv.height = H;
  const GOLD = '#f2c14e', GOLD2 = '#ffdf8e';
  const TAU = Math.PI * 2;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k * k * (3 - 2 * k);
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  function lin(x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([k, c]) => g.addColorStop(k, c));
    return g;
  }
  function rad(x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([k, c]) => g.addColorStop(k, c));
    return g;
  }
  function glow(x, y, r, color, alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = rad(x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }

  // ───────────────────────── décors ─────────────────────────
  function toits(y, color, seed, n, hMin, hMax, lights) {
    const r = rng(seed); ctx.fillStyle = color;
    let x = -40;
    while (x < W + 40) {
      const w = 70 + r() * 150, h = hMin + r() * (hMax - hMin);
      ctx.fillRect(x, y - h, w, h + 400);
      if (r() < 0.28) { ctx.beginPath(); ctx.arc(x + w / 2, y - h, w * 0.32, Math.PI, 0); ctx.fill(); }
      else if (r() < 0.12) { ctx.fillRect(x + w * 0.4, y - h - 90, w * 0.2, 90); ctx.fillRect(x + w * 0.35, y - h - 100, w * 0.3, 14); }
      if (lights) for (let k = 0; k < 2; k++) if (r() < 0.5) {
        ctx.save(); ctx.fillStyle = 'rgba(255,200,110,0.85)';
        ctx.fillRect(x + 12 + r() * (w - 36), y - h + 24 + r() * (h - 50), 12, 18); ctx.restore();
      }
      x += w + r() * 14;
    }
  }
  function etoile8(x, y, rr, color) {
    ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - Math.PI / 2, d = i % 2 ? rr * 0.55 : rr; ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
    ctx.closePath(); ctx.fill();
  }
  function zellige(x0, y0, w, h, size, c1, c2, c3) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    ctx.fillStyle = c1; ctx.fillRect(x0, y0, w, h);
    for (let y = y0; y < y0 + h + size; y += size)
      for (let x = x0; x < x0 + w + size; x += size) {
        etoile8(x + size / 2, y + size / 2, size * 0.42, c2);
        ctx.fillStyle = c3; ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size * 0.11, 0, TAU); ctx.fill();
      }
    ctx.restore();
  }
  function arche(cx, base, w, h, fill) {
    ctx.fillStyle = fill; ctx.beginPath();
    ctx.moveTo(cx - w / 2, base); ctx.lineTo(cx - w / 2, base - h * 0.55);
    ctx.bezierCurveTo(cx - w / 2, base - h * 0.78, cx - w * 0.36, base - h * 0.86, cx, base - h);
    ctx.bezierCurveTo(cx + w * 0.36, base - h * 0.86, cx + w / 2, base - h * 0.78, cx + w / 2, base - h * 0.55);
    ctx.lineTo(cx + w / 2, base); ctx.closePath(); ctx.fill();
  }
  function rayons(x, y, longueur, couleur, a, t, n = 4) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const dx = 90 + i * 150, dec = Math.sin(t * 0.4 + i) * 8;
      ctx.fillStyle = lin(x + dx, y, x + dx + 220, y + longueur, [[0, couleur], [1, 'rgba(255,255,255,0)']]);
      ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(t * 0.7 + i * 2));
      ctx.beginPath(); ctx.moveTo(x + dx + dec, y); ctx.lineTo(x + dx + 70 + dec, y);
      ctx.lineTo(x + dx + 330, y + longueur); ctx.lineTo(x + dx + 220, y + longueur); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function oiseaux(t, y0, n, seed) {
    const r = rng(seed); ctx.save(); ctx.strokeStyle = 'rgba(20,12,30,0.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const sp = 24 + r() * 30, x = ((r() * W + t * sp) % (W + 200)) - 100, y = y0 + r() * 260 + Math.sin(t * 2 + i) * 10, f = Math.sin(t * 8 + i) * 8;
      ctx.beginPath(); ctx.moveTo(x - 18, y - f); ctx.quadraticCurveTo(x - 8, y - 12, x, y); ctx.quadraticCurveTo(x + 8, y - 12, x + 18, y - f); ctx.stroke();
    }
    ctx.restore();
  }

  const DECORS = {
    aube(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#14143f'], [0.35, '#5a3a7a'], [0.62, '#d97b6c'], [0.8, '#f6b26b'], [1, '#2a1a2a']]); ctx.fillRect(0, 0, W, H);
      const r = rng(7); for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6 * (0.6 + 0.4 * Math.sin(t * 2 + i))})`; ctx.fillRect(r() * W, r() * 700, 3, 3); }
      glow(W * 0.5, 1180, 700, 'rgba(255,190,110,0.9)', 0.9);
      toits(1250, '#3a2342', 11, 8, 70, 190, false); toits(1360, '#241528', 23, 8, 90, 260, true); toits(1520, '#150c1a', 5, 6, 120, 330, true);
      oiseaux(t, 380, 7, 3);
      // la fenêtre allumée
      glow(300, 1560, 260, 'rgba(255,200,120,0.9)', 0.9); ctx.fillStyle = '#ffd88a'; ctx.fillRect(270, 1520, 60, 80);
    },
    atelier(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#2a1810'], [0.55, '#5e3a22'], [1, '#2b1a12']]); ctx.fillRect(0, 0, W, H);
      zellige(0, 1180, W, 740, 90, '#173f5c', '#c9923a', '#f2d089');
      ctx.fillStyle = 'rgba(20,10,5,0.35)'; ctx.fillRect(0, 1180, W, 740);
      arche(820, 1180, 360, 700, '#f6d99a'); arche(820, 1180, 300, 640, lin(0, 560, 0, 1180, [[0, '#ffe9b0'], [1, '#ffd070']]));
      rayons(500, 620, 900, 'rgba(255,220,150,0.7)', 0.35, t, 4);
      // tambour à broder
      ctx.strokeStyle = '#3a2214'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(180, 1500); ctx.lineTo(180, 1180); ctx.stroke();
      ctx.lineWidth = 14; ctx.strokeStyle = '#8a5a30'; ctx.beginPath(); ctx.arc(180, 1100, 120, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#c0394d'; ctx.beginPath(); ctx.arc(180, 1100, 108, 0, TAU); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.beginPath(); for (let a = 0; a < 6.3; a += 0.2) ctx.lineTo(180 + Math.cos(a) * (20 + a * 12), 1100 + Math.sin(a) * (20 + a * 12)); ctx.stroke();
      // tissus suspendus
      const cols = ['#b83255', '#1d6b6b', '#d99a2b', '#5b2a86', '#2d7d46'];
      for (let i = 0; i < 5; i++) { ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(40 + i * 40, 0); ctx.lineTo(80 + i * 40, 0); ctx.lineTo(70 + i * 40 + Math.sin(t + i) * 6, 380 + i * 30); ctx.lineTo(30 + i * 40 + Math.sin(t + i) * 6, 360 + i * 30); ctx.fill(); }
      ctx.globalAlpha = 1;
      glow(540, 300, 480, 'rgba(255,190,100,0.55)', 0.8 + 0.1 * Math.sin(t * 3));
    },
    toits(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0f1030'], [0.4, '#4b2b6d'], [0.7, '#d3695f'], [1, '#2a1520']]); ctx.fillRect(0, 0, W, H);
      const r = rng(9); for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))})`; ctx.fillRect(r() * W, r() * 800, 3, 3); }
      glow(820, 340, 300, 'rgba(255,240,200,0.6)', 0.9); ctx.fillStyle = '#fff3d0'; ctx.beginPath(); ctx.arc(820, 340, 90, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4b2b6d'; ctx.beginPath(); ctx.arc(850, 322, 84, 0, TAU); ctx.fill();
      toits(1250, '#2c1a3e', 31, 8, 80, 220, false); toits(1400, '#1b1028', 41, 8, 100, 300, true);
      ctx.fillStyle = '#120a1c'; ctx.fillRect(0, 1560, W, 400); ctx.fillStyle = '#1c1128'; ctx.fillRect(0, 1540, W, 24);
      for (let x = 20; x < W; x += 70) ctx.fillRect(x, 1480, 12, 80);
      oiseaux(t, 480, 5, 12);
    },
    lycee(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#d9c9a5'], [0.6, '#cdb78a'], [1, '#8a7655']]); ctx.fillRect(0, 0, W, H);
      zellige(0, 1100, W, 820, 100, '#1d5a7a', '#e8d9b0', '#c9923a');
      arche(540, 1100, 620, 880, '#7d6a48'); arche(540, 1100, 520, 800, lin(0, 300, 0, 1100, [[0, '#fff4d6'], [1, '#f2d9a0']]));
      zellige(40, 380, 120, 720, 60, '#b79a62', '#7d6a48', '#e8d9b0'); zellige(920, 380, 120, 720, 60, '#b79a62', '#7d6a48', '#e8d9b0');
      rayons(120, 120, 1000, 'rgba(255,240,200,0.8)', 0.3, t, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, 1300 + i * 110, W, 3);
    },
    villa(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0e3b2d'], [0.5, '#145a40'], [1, '#2c1010']]); ctx.fillRect(0, 0, W, H);
      zellige(0, 0, W, 560, 120, '#0e3b2d', '#c9923a', '#f2d089'); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, W, 560);
      arche(270, 1250, 380, 820, '#caa24a'); arche(270, 1250, 320, 760, '#10382b'); arche(810, 1250, 380, 820, '#caa24a'); arche(810, 1250, 320, 760, '#10382b');
      ctx.fillStyle = lin(0, 1250, 0, H, [[0, '#7a1626'], [1, '#2c0a10']]); ctx.fillRect(0, 1250, W, 670);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.strokeRect(80, 1330, W - 160, 500);
      // lustre
      ctx.strokeStyle = '#caa24a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(540, 0); ctx.lineTo(540, 300); ctx.stroke();
      for (let i = -3; i <= 3; i++) { const x = 540 + i * 56, y = 330 + Math.abs(i) * 24; glow(x, y, 110, 'rgba(255,215,130,0.8)', 0.7 + 0.2 * Math.sin(t * 3 + i)); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill(); }
      glow(540, 340, 520, 'rgba(255,200,100,0.35)', 1);
    },
    hopital(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#bcd6d8'], [0.6, '#8fb3b8'], [1, '#33474d']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9f3f2'; ctx.fillRect(110, 220, 560, 760);
      for (let i = 0; i < 10; i++) { ctx.fillStyle = `rgba(255,255,255,${0.5})`; ctx.fillRect(130, 240 + i * 74, 520, 48); }
      ctx.fillStyle = lin(0, 220, 0, 980, [[0, '#9ec5e8'], [1, '#e8f1ff']]); ctx.globalAlpha = 0.5; ctx.fillRect(110, 220, 560, 760); ctx.globalAlpha = 1;
      rayons(200, 220, 1100, 'rgba(255,255,255,0.8)', 0.25, t, 3);
      ctx.fillStyle = '#4b6168'; ctx.fillRect(0, 1450, W, 470); ctx.fillStyle = '#dfe9ea'; ctx.fillRect(0, 1420, W, 26);
      // moniteur
      ctx.fillStyle = '#0c1a1f'; ctx.fillRect(740, 480, 280, 190); ctx.strokeStyle = '#3fe08f'; ctx.lineWidth = 4; ctx.beginPath();
      for (let x = 0; x < 260; x += 4) { const ph = ((x / 260 + t * 0.5) % 1); const y = 575 - (ph > 0.48 && ph < 0.5 ? 70 : ph > 0.5 && ph < 0.52 ? -40 : 0); ctx.lineTo(750 + x, y); } ctx.stroke();
      ctx.fillStyle = '#9ab4b8'; ctx.fillRect(868, 670, 24, 700);
    },
    gala(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#1a0d1e'], [0.5, '#3b1630'], [1, '#150a14']]); ctx.fillRect(0, 0, W, H);
      const r = rng(77);
      for (let i = 0; i < 46; i++) { const x = r() * W, y = 200 + r() * 1100, s = 30 + r() * 90, dy = Math.sin(t * 0.8 + i) * 14; glow(x, y + dy, s, `rgba(255,${180 + (r() * 60) | 0},${90 + (r() * 80) | 0},0.7)`, 0.35 + 0.3 * r()); }
      ctx.fillStyle = '#7a1230'; ctx.fillRect(0, 0, 150, H); ctx.fillRect(W - 150, 0, 150, H);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(10 + i * 24, 0, 6, H); ctx.fillRect(W - 140 + i * 24, 0, 6, H); }
      glow(540, 260, 600, 'rgba(255,215,140,0.55)', 1);
      for (let i = -4; i <= 4; i++) { const x = 540 + i * 70, y = 280 + Math.abs(i) * 26; ctx.fillStyle = '#fff1c4'; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill(); }
      // silhouettes de la foule
      ctx.fillStyle = '#0a050c'; const rr = rng(5);
      for (let x = -20; x < W + 40; x += 85) { const y = 1480 + rr() * 90; ctx.beginPath(); ctx.arc(x, y - 70, 42, 0, TAU); ctx.fill(); ctx.fillRect(x - 58, y - 30, 116, 600); }
    },
  };

  function teinte(tint, t) {
    if (tint === 'nuit') { ctx.fillStyle = 'rgba(8,10,40,0.55)'; ctx.fillRect(0, 0, W, H); }
    if (tint === 'froid') { ctx.fillStyle = 'rgba(40,70,110,0.28)'; ctx.fillRect(0, 0, W, H); }
    if (tint === 'pluie') {
      ctx.fillStyle = 'rgba(8,14,40,0.45)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(200,220,255,0.35)'; ctx.lineWidth = 3; const r = rng(2);
      for (let i = 0; i < 140; i++) { const x0 = r() * W, sp = 900 + r() * 700, y0 = ((r() * H + t * sp) % (H + 200)) - 100; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 24, y0 + 70); ctx.stroke(); }
      const e = Math.sin(t * 0.9) * Math.sin(t * 2.3); if (e > 0.93) { ctx.fillStyle = 'rgba(220,230,255,0.4)'; ctx.fillRect(0, 0, W, H); }
    }
  }

  // ───────────────────────── personnages ─────────────────────────
  const LOOKS = {
    amal: { peau: '#c4885f', ombre: '#a06a48', cheveux: '#1b1217', reflet: '#4a3340', oeil: '#6b4423', haut: '#e6d5ae', haut2: '#c9b387', style: 'long', cicatrice: true, patch: true },
    ghita: { peau: '#e6bb94', ombre: '#c99a72', cheveux: '#2a1b16', reflet: '#5a3f33', oeil: '#3a6b5a', haut: '#1f2d5c', haut2: '#fff', style: 'bob', broche: true },
    reda: { peau: '#d4a37c', ombre: '#b4835e', cheveux: '#1d1411', reflet: '#4a352c', oeil: '#3a2a1f', haut: '#2b3f73', haut2: '#fff', style: 'court' },
    idriss: { peau: '#b97d56', ombre: '#98603f', cheveux: '#110c0b', reflet: '#3a2a26', oeil: '#2b1a0e', haut: '#4a7a8c', haut2: '#d9a441', style: 'ebouriffe', cicatriceMenton: true },
    rkia: { peau: '#c6926c', ombre: '#a6724f', cheveux: '#222', reflet: '#444', oeil: '#4a2f1a', haut: '#7a3b55', haut2: '#d4a3b6', style: 'voile', voile: '#7a3b55', rides: 1 },
    kenza: { peau: '#e0b896', ombre: '#c0976f', cheveux: '#ddd', reflet: '#fff', oeil: '#3b4a5a', haut: '#6e1d3a', haut2: '#caa24a', style: 'voile', voile: '#efe7d6', bord: '#caa24a', rides: 2, perles: true },
  };

  const BROWS = {
    neutre: [0, 0], joie: [-4, -4], triste: [-16, 6], colere: [14, -8], surprise: [-20, -20], peur: [-14, -2],
    malade: [-10, 6], froid: [2, -10], tendre: [-6, 2], pleure: [-18, 8],
  };
  const OEIL = { neutre: 1, joie: 0.78, triste: 0.85, colere: 0.82, surprise: 1.28, peur: 1.2, malade: 0.62, froid: 0.72, tendre: 0.88, pleure: 0.8 };

  function ovale(R) {
    ctx.beginPath(); ctx.moveTo(-0.8 * R, -0.12 * R);
    ctx.bezierCurveTo(-0.8 * R, -1.08 * R, 0.8 * R, -1.08 * R, 0.8 * R, -0.12 * R);
    ctx.bezierCurveTo(0.8 * R, 0.52 * R, 0.4 * R, 0.98 * R, 0, 1.02 * R);
    ctx.bezierCurveTo(-0.4 * R, 0.98 * R, -0.8 * R, 0.52 * R, -0.8 * R, -0.12 * R); ctx.closePath();
  }

  function oeil(x, y, R, L, ouv, regard, cote, t, emo) {
    const w = 0.235 * R, h = 0.3 * R * ouv;
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.ellipse(0, 0, w, Math.max(2, h), 0, 0, TAU); ctx.save(); ctx.clip();
    ctx.fillStyle = '#fbf6ee'; ctx.fillRect(-w, -h, w * 2, h * 2);
    const ix = regard * w * 0.35, ir = Math.min(w * 0.98, 0.225 * R * Math.min(1.1, ouv + 0.25));
    ctx.fillStyle = lin(0, -ir, 0, ir, [[0, L.oeil], [0.7, '#2a1a10'], [1, L.oeil]]); ctx.beginPath(); ctx.arc(ix, 0, ir, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0b0707'; ctx.beginPath(); ctx.arc(ix, 0, ir * 0.55, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ix - ir * 0.35, -ir * 0.38, ir * 0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(ix + ir * 0.35, ir * 0.35, ir * 0.14, 0, TAU); ctx.fill();
    if (emo === 'pleure' || emo === 'tendre' || emo === 'triste') { ctx.fillStyle = 'rgba(200,225,255,0.22)'; ctx.fillRect(-w, h * 0.7, w * 2, h * 0.4); }
    ctx.restore();
    ctx.strokeStyle = '#140b0b'; ctx.lineWidth = 0.05 * R; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(0, 0, w, Math.max(2, h), 0, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
    ctx.lineWidth = 0.02 * R; ctx.beginPath(); ctx.ellipse(0, 0, w, Math.max(2, h), 0, 0.15, Math.PI - 0.15); ctx.stroke();
    ctx.lineWidth = 0.03 * R; ctx.beginPath(); ctx.moveTo(cote * w * 0.95, -h * 0.15); ctx.lineTo(cote * (w + 0.06 * R), -h * 0.55); ctx.stroke();
    ctx.restore();
  }

  function bouche(R, emo, talk, L) {
    const y = 0.54 * R, w = 0.2 * R;
    ctx.save(); ctx.translate(0, y); ctx.lineCap = 'round'; ctx.lineWidth = 0.035 * R; ctx.strokeStyle = '#7a2e2e';
    const ouv = clamp(talk) * 0.15 * R;
    let coin = { neutre: 0, joie: -0.07, triste: 0.07, colere: 0.02, surprise: 0, peur: 0.03, malade: 0.05, froid: -0.02, tendre: -0.03, pleure: 0.1 }[emo] * R;
    if (emo === 'surprise' || emo === 'peur') { ctx.fillStyle = '#5a1c22'; ctx.beginPath(); ctx.ellipse(0, 0, 0.07 * R + ouv * 0.2, 0.07 * R + ouv * 0.8, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (ouv > 3) {
      ctx.fillStyle = '#4b1620'; ctx.beginPath(); ctx.moveTo(-w, coin * 0.4); ctx.quadraticCurveTo(0, -ouv * 0.3 - coin * 0.6, w, coin * 0.4);
      ctx.quadraticCurveTo(0, ouv * 1.25 - coin * 0.2, -w, coin * 0.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6efe6'; ctx.fillRect(-w * 0.55, -ouv * 0.1, w * 1.1, ouv * 0.28);
      ctx.fillStyle = '#c4585f'; ctx.beginPath(); ctx.ellipse(0, ouv * 0.85, w * 0.45, ouv * 0.28, 0, 0, TAU); ctx.fill();
      ctx.stroke();
    } else { ctx.beginPath(); ctx.moveTo(-w, coin); ctx.quadraticCurveTo(0, -coin * 1.2 + (emo === 'joie' ? 0.06 * R : 0), w, coin + (emo === 'froid' ? -0.05 * R : 0)); ctx.stroke(); }
    ctx.restore();
  }

  function cheveuxArriere(R, L) {
    ctx.fillStyle = L.cheveux;
    if (L.style === 'long') {
      ctx.beginPath(); ctx.moveTo(-0.95 * R, -0.2 * R); ctx.bezierCurveTo(-1.35 * R, 0.6 * R, -1.2 * R, 1.8 * R, -1.45 * R, 2.4 * R);
      ctx.lineTo(1.45 * R, 2.4 * R); ctx.bezierCurveTo(1.2 * R, 1.8 * R, 1.35 * R, 0.6 * R, 0.95 * R, -0.2 * R);
      ctx.bezierCurveTo(0.9 * R, -1.3 * R, -0.9 * R, -1.3 * R, -0.95 * R, -0.2 * R); ctx.fill();
    } else if (L.style === 'bob') {
      ctx.beginPath(); ctx.moveTo(-0.95 * R, -0.3 * R); ctx.bezierCurveTo(-1.15 * R, 0.5 * R, -1.1 * R, 1.0 * R, -0.8 * R, 1.1 * R);
      ctx.lineTo(0.8 * R, 1.1 * R); ctx.bezierCurveTo(1.1 * R, 1.0 * R, 1.15 * R, 0.5 * R, 0.95 * R, -0.3 * R);
      ctx.bezierCurveTo(0.9 * R, -1.3 * R, -0.9 * R, -1.3 * R, -0.95 * R, -0.3 * R); ctx.fill();
    } else if (L.style === 'voile') {
      ctx.fillStyle = L.voile; ctx.beginPath(); ctx.moveTo(-1.0 * R, -0.1 * R); ctx.bezierCurveTo(-1.1 * R, -1.4 * R, 1.1 * R, -1.4 * R, 1.0 * R, -0.1 * R);
      ctx.bezierCurveTo(1.25 * R, 0.8 * R, 1.35 * R, 1.8 * R, 1.6 * R, 2.4 * R); ctx.lineTo(-1.6 * R, 2.4 * R); ctx.bezierCurveTo(-1.35 * R, 1.8 * R, -1.25 * R, 0.8 * R, -1.0 * R, -0.1 * R); ctx.fill();
    }
  }
  function cheveuxAvant(R, L, t) {
    const sway = Math.sin(t * 1.3) * 0.012 * R;
    ctx.fillStyle = L.cheveux;
    if (L.style === 'long') {
      ctx.beginPath(); ctx.moveTo(-0.84 * R, -0.05 * R); ctx.bezierCurveTo(-0.9 * R, -1.1 * R, 0.9 * R, -1.1 * R, 0.84 * R, -0.05 * R);
      ctx.bezierCurveTo(0.7 * R, -0.5 * R, 0.4 * R, -0.75 * R, 0.05 * R, -0.9 * R);
      ctx.bezierCurveTo(-0.3 * R, -0.7 * R, -0.62 * R, -0.5 * R, -0.84 * R, -0.05 * R); ctx.fill();
      ctx.strokeStyle = L.reflet; ctx.lineWidth = 0.025 * R; ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.85 * R); ctx.quadraticCurveTo(-0.7 * R + sway, -0.4 * R, -0.78 * R, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.4 * R, -0.9 * R); ctx.quadraticCurveTo(0.7 * R, -0.4 * R, 0.78 * R, 0); ctx.stroke();
    } else if (L.style === 'bob') {
      ctx.beginPath(); ctx.moveTo(-0.84 * R, 0.1 * R); ctx.bezierCurveTo(-0.9 * R, -1.1 * R, 0.9 * R, -1.1 * R, 0.84 * R, 0.1 * R);
      ctx.lineTo(0.84 * R, -0.34 * R); ctx.quadraticCurveTo(0, -0.18 * R, -0.84 * R, -0.34 * R); ctx.fill();
      ctx.fillStyle = '#c9a24a'; ctx.fillRect(-0.84 * R, -0.62 * R, 1.68 * R, 0.07 * R);
    } else if (L.style === 'court') {
      ctx.beginPath(); ctx.moveTo(-0.84 * R, -0.1 * R); ctx.bezierCurveTo(-0.95 * R, -1.15 * R, 0.95 * R, -1.15 * R, 0.84 * R, -0.1 * R);
      ctx.bezierCurveTo(0.5 * R, -0.55 * R, 0.1 * R, -0.62 * R, -0.2 * R, -0.5 * R); ctx.bezierCurveTo(-0.5 * R, -0.45 * R, -0.75 * R, -0.3 * R, -0.84 * R, -0.1 * R); ctx.fill();
    } else if (L.style === 'ebouriffe') {
      ctx.beginPath(); ctx.moveTo(-0.88 * R, -0.05 * R);
      for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI, rr = (i % 2 ? 1.3 : 1.04) * R; ctx.lineTo(Math.cos(a) * rr * 0.96, Math.sin(a) * rr - 0.12 * R); }
      ctx.lineTo(0.88 * R, -0.05 * R);
      const fr = [[0.74, -0.42], [0.52, -0.3], [0.32, -0.64], [0.1, -0.4], [-0.14, -0.68], [-0.36, -0.4], [-0.6, -0.58], [-0.86, -0.12]];
      for (const [fx, fy] of fr) ctx.lineTo(fx * R, fy * R);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = L.reflet; ctx.lineWidth = 0.025 * R; ctx.beginPath(); ctx.moveTo(-0.3 * R, -1.0 * R); ctx.lineTo(-0.1 * R, -0.5 * R); ctx.moveTo(0.3 * R, -1.05 * R); ctx.lineTo(0.2 * R, -0.55 * R); ctx.stroke();
    } else if (L.style === 'voile') {
      ctx.fillStyle = L.voile; ctx.beginPath(); ctx.moveTo(-0.86 * R, 0.25 * R); ctx.bezierCurveTo(-0.95 * R, -1.15 * R, 0.95 * R, -1.15 * R, 0.86 * R, 0.25 * R);
      ctx.bezierCurveTo(0.84 * R, -0.3 * R, 0.55 * R, -0.62 * R, 0, -0.66 * R); ctx.bezierCurveTo(-0.55 * R, -0.62 * R, -0.84 * R, -0.3 * R, -0.86 * R, 0.25 * R); ctx.fill();
      ctx.strokeStyle = L.bord || 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.03 * R; ctx.beginPath(); ctx.moveTo(-0.84 * R, 0.2 * R); ctx.bezierCurveTo(-0.82 * R, -0.3 * R, -0.55 * R, -0.6 * R, 0, -0.64 * R); ctx.bezierCurveTo(0.55 * R, -0.6 * R, 0.82 * R, -0.3 * R, 0.84 * R, 0.2 * R); ctx.stroke();
    }
  }

  function epaules(R, L, id) {
    ctx.fillStyle = L.haut; ctx.beginPath(); ctx.moveTo(-1.9 * R, 7 * R); ctx.bezierCurveTo(-1.9 * R, 1.55 * R, -1.1 * R, 1.3 * R, -0.45 * R, 1.12 * R);
    ctx.lineTo(0.45 * R, 1.12 * R); ctx.bezierCurveTo(1.1 * R, 1.3 * R, 1.9 * R, 1.55 * R, 1.9 * R, 7 * R); ctx.closePath(); ctx.fill();
    ctx.fillStyle = L.haut2; ctx.globalAlpha = 0.9;
    if (id === 'ghita' || id === 'reda') { ctx.beginPath(); ctx.moveTo(-0.45 * R, 1.1 * R); ctx.lineTo(0, 1.55 * R); ctx.lineTo(0.45 * R, 1.1 * R); ctx.lineTo(0.3 * R, 1.05 * R); ctx.lineTo(0, 1.3 * R); ctx.lineTo(-0.3 * R, 1.05 * R); ctx.fill(); }
    else if (id === 'idriss') { ctx.beginPath(); ctx.ellipse(0, 1.2 * R, 0.55 * R, 0.2 * R, 0, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-0.4 * R, 1.1 * R); ctx.quadraticCurveTo(0, 1.55 * R, 0.4 * R, 1.1 * R); ctx.lineTo(0.3 * R, 1.08 * R); ctx.quadraticCurveTo(0, 1.35 * R, -0.3 * R, 1.08 * R); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (L.patch) { ctx.fillStyle = '#9b7a4e'; ctx.fillRect(0.7 * R, 1.8 * R, 0.4 * R, 0.4 * R); ctx.strokeStyle = '#f2e2bb'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(0.7 * R, 1.8 * R, 0.4 * R, 0.4 * R); ctx.setLineDash([]); }
    if (L.broche) { glow(-0.75 * R, 1.8 * R, 60, 'rgba(255,215,120,0.9)', 0.9); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(-0.75 * R, 1.8 * R, 0.09 * R, 0, TAU); ctx.fill(); }
    if (L.perles) { ctx.fillStyle = '#f7f1e4'; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.arc(i * 0.1 * R, 1.17 * R + Math.abs(i) * 0.03 * R + 0.22 * R * (1 - Math.cos(i * 0.4)), 0.05 * R, 0, TAU); ctx.fill(); } }
  }

  function perso(id, cx, cy, sc, emo, talk, t, regard, dim) {
    const L = LOOKS[id]; if (!L) return;
    const R = 175;
    ctx.save(); ctx.translate(cx, cy + Math.sin(t * 1.6 + id.length) * 3); ctx.scale(sc, sc * (1 + Math.sin(t * 1.6) * 0.004));
    // ombre portée douce
    glow(0, 1.3 * R, 360, 'rgba(0,0,0,0.5)', 0.35);
    cheveuxArriere(R, L);
    ctx.fillStyle = L.ombre; ctx.fillRect(-0.28 * R, 0.8 * R, 0.56 * R, 0.5 * R);
    epaules(R, L, id);
    // visage
    ctx.fillStyle = lin(-R, -R, R, R, [[0, L.peau], [1, L.ombre]]); ovale(R); ctx.fill();
    ctx.save(); ovale(R); ctx.clip();
    ctx.fillStyle = lin(-0.2 * R, 0, R, 0, [[0, 'rgba(60,20,10,0)'], [1, 'rgba(60,20,10,0.2)']]); ctx.fillRect(-R, -1.2 * R, 2 * R, 2.4 * R);
    ctx.restore();
    // joues
    const rose = emo === 'pleure' || emo === 'joie' || emo === 'tendre' || emo === 'surprise' || emo === 'peur' ? 0.38 : 0.2;
    glow(-0.5 * R, 0.32 * R, 0.3 * R, 'rgba(235,100,110,0.9)', rose); glow(0.5 * R, 0.32 * R, 0.3 * R, 'rgba(235,100,110,0.9)', rose);
    // nez
    ctx.strokeStyle = 'rgba(100,50,30,0.5)'; ctx.lineWidth = 0.03 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.03 * R, 0.2 * R); ctx.quadraticCurveTo(0.06 * R, 0.34 * R, -0.03 * R, 0.37 * R); ctx.stroke();
    // yeux
    const cycle = (t * 0.28 + id.length * 0.37) % 1; const clin = cycle > 0.96 ? 1 - Math.sin((cycle - 0.96) / 0.04 * Math.PI) * 0.95 : 1;
    const ouv = (OEIL[emo] || 1) * clin;
    oeil(-0.38 * R, 0.1 * R, R, L, ouv, regard, -1, t, emo); oeil(0.38 * R, 0.1 * R, R, L, ouv, regard, 1, t, emo);
    // sourcils
    const [bi, bo] = BROWS[emo] || [0, 0]; ctx.strokeStyle = L.cheveux === '#ddd' ? '#aaa' : L.cheveux; ctx.lineWidth = 0.055 * R; ctx.lineCap = 'round';
    const by = -0.27 * R;
    ctx.beginPath(); ctx.moveTo(-0.58 * R, by + bo * 0.01 * R * 1.0 + (bo) * 0.5); ctx.quadraticCurveTo(-0.38 * R, by - 0.06 * R + bi * 0.3, -0.16 * R, by + bi * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.58 * R, by + bo * 0.5); ctx.quadraticCurveTo(0.38 * R, by - 0.06 * R + bi * 0.3, 0.16 * R, by + bi * 0.9); ctx.stroke();
    // cicatrices
    if (L.cicatrice) {
      ctx.save(); ctx.strokeStyle = '#a2584a'; ctx.lineWidth = 0.042 * R; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-0.52 * R, -0.42 * R); ctx.quadraticCurveTo(-0.62 * R, -0.05 * R, -0.5 * R, 0.4 * R); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,215,195,0.55)'; ctx.lineWidth = 0.02 * R; ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.42 * R); ctx.quadraticCurveTo(-0.6 * R, -0.05 * R, -0.48 * R, 0.4 * R); ctx.stroke();
      ctx.restore();
    }
    if (L.cicatriceMenton) { ctx.strokeStyle = '#8f4a3a'; ctx.lineWidth = 0.035 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0.2 * R, 0.78 * R); ctx.lineTo(0.38 * R, 0.9 * R); ctx.stroke(); }
    if (L.rides) { ctx.strokeStyle = 'rgba(90,50,30,0.35)'; ctx.lineWidth = 0.018 * R; for (let k = 0; k < 2 + L.rides; k++) { ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.1 * R + k * 0.06 * R); ctx.quadraticCurveTo(-0.3 * R, -0.14 * R + k * 0.06 * R, -0.12 * R, -0.1 * R + k * 0.06 * R); ctx.stroke(); } }
    bouche(R, emo, talk, L);
    // larmes
    if (emo === 'pleure') {
      for (const s of [-1, 1]) {
        const ph = (t * 0.7 + (s > 0 ? 0.3 : 0)) % 1, len = 0.2 * R + ph * 0.9 * R;
        ctx.strokeStyle = 'rgba(200,230,255,0.85)'; ctx.lineWidth = 0.035 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s * 0.36 * R, 0.28 * R); ctx.quadraticCurveTo(s * 0.4 * R, 0.4 * R + len * 0.4, s * 0.38 * R, 0.28 * R + len); ctx.stroke();
        ctx.fillStyle = 'rgba(230,245,255,0.95)'; ctx.beginPath(); ctx.arc(s * 0.38 * R, 0.28 * R + len, 0.04 * R, 0, TAU); ctx.fill();
      }
    }
    cheveuxAvant(R, L, t);
    ctx.restore();
    if (dim > 0) { /* assombri géré par l'appelant */ }
  }

  // ───────────────────────── ambiance et texte ─────────────────────────
  let grainCanvas = null;
  function grain() {
    if (!grainCanvas) {
      grainCanvas = document.createElement('canvas'); grainCanvas.width = 256; grainCanvas.height = 256; const g = grainCanvas.getContext('2d'); const d = g.createImageData(256, 256); const r = rng(1);
      for (let i = 0; i < d.data.length; i += 4) { const v = (r() * 255) | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; }
      g.putImageData(d, 0, 0);
    }
    return grainCanvas;
  }
  function poussieres(t, n, couleur) {
    const r = rng(99); ctx.save(); ctx.fillStyle = couleur;
    for (let i = 0; i < n; i++) { const x = (r() * W + Math.sin(t * 0.3 + i) * 40 + t * 8 * (0.3 + r())) % W, y = (r() * H - t * 12 * (0.2 + r()) + H * 4) % H, s = 2 + r() * 4; ctx.globalAlpha = 0.15 + 0.35 * Math.abs(Math.sin(t * 0.8 + i)); ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function vignette() {
    ctx.fillStyle = rad(W / 2, H * 0.45, H * 0.28, H * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.62)']]); ctx.fillRect(0, 0, W, H);
  }
  function bandeBas() {
    ctx.fillStyle = lin(0, 1180, 0, 1700, [[0, 'rgba(8,6,16,0)'], [0.5, 'rgba(8,6,16,0.78)'], [1, 'rgba(8,6,16,0.92)']]); ctx.fillRect(0, 1180, W, 740);
  }

  function lignes(texte, max, taille) {
    ctx.font = `800 ${taille}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    const mots = texte.split(' '); const out = []; let cur = '';
    for (const m of mots) { const essai = cur ? cur + ' ' + m : m; if (ctx.measureText(essai.replace(/\*/g, '')).width > max && cur) { out.push(cur); cur = m; } else cur = essai; }
    if (cur) out.push(cur); return out;
  }
  function sousTitre(nom, texte, prog, alpha) {
    const taille = 56; const max = 900; const ls = lignes(texte, max, taille);
    const total = texte.replace(/\*/g, '').length; let visibles = Math.ceil(total * clamp(prog));
    const hauteur = ls.length * (taille + 14); let y = 1480 - hauteur / 2;
    ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (nom) { ctx.font = '900 34px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = GOLD; ctx.fillText(nom.toUpperCase(), W / 2, y - 54); }
    ctx.font = `800 ${taille}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`; ctx.lineJoin = 'round';
    for (const ligne of ls) {
      // dessine mot par mot pour colorer la darija
      const segs = ligne.split(/(\*[^*]+\*)/).filter(Boolean).map((s) => (s.startsWith('*') ? { t: s.slice(1, -1), c: GOLD2 } : { t: s, c: '#ffffff' }));
      const largeur = segs.reduce((a, s) => a + ctx.measureText(s.t).width, 0); let x = W / 2 - largeur / 2; ctx.textAlign = 'left';
      for (const s of segs) {
        const part = s.t.slice(0, Math.max(0, visibles)); visibles -= s.t.length;
        if (part) { ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(8,6,16,0.9)'; ctx.strokeText(part, x, y); ctx.fillStyle = s.c; ctx.fillText(part, x, y); }
        x += ctx.measureText(s.t).width;
      }
      y += taille + 14;
    }
    ctx.restore();
  }
  function entete(ep, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.textBaseline = 'middle';
    ctx.font = '900 34px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = GOLD; ctx.textAlign = 'left'; ctx.fillText('LE FIL D’OR', 54, 96);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('ÉPISODE ' + ep, W - 54, 96);
    ctx.restore();
  }
  function filOr(prog, y, amp) {
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.shadowColor = GOLD; ctx.shadowBlur = 24; ctx.beginPath();
    const n = Math.floor(120 * clamp(prog)); for (let i = 0; i <= n; i++) { const x = 90 + (i / 120) * (W - 180); const yy = y + Math.sin(i / 120 * TAU * 1.5) * amp; if (i) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); }
    ctx.stroke(); ctx.restore();
  }
  function carteTitre(S, t, tl, dur) {
    ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0a0614'], [0.5, '#2a1238'], [1, '#0a0614']]); ctx.fillRect(0, 0, W, H);
    glow(W / 2, 900, 700, 'rgba(242,193,78,0.35)', 1); poussieres(t, 40, '#ffe9a8');
    const a = ease(clamp(tl / 0.8)), b = ease(clamp((tl - 0.6) / 0.8)), c = ease(clamp((tl - 1.3) / 0.7));
    filOr(tl / 1.4, 780, 60);
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.font = '900 150px Georgia, "Times New Roman", serif'; ctx.shadowColor = GOLD; ctx.shadowBlur = 40; ctx.fillText('Le Fil d’or', W / 2, 640);
    ctx.globalAlpha = b; ctx.shadowBlur = 0; ctx.font = '800 44px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = GOLD; ctx.fillText('ÉPISODE ' + S.numero, W / 2, 980);
    ctx.globalAlpha = c; ctx.fillStyle = '#fff'; ctx.font = '800 70px "Segoe UI", Arial, sans-serif'; ctx.fillText(S.titre, W / 2, 1090);
    ctx.restore();
  }
  function carteFin(S, t, tl) {
    ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0a0614'], [0.5, '#2a1238'], [1, '#0a0614']]); ctx.fillRect(0, 0, W, H);
    glow(W / 2, 900, 700, 'rgba(242,193,78,0.3)', 1); poussieres(t, 40, '#ffe9a8');
    const a = ease(clamp(tl / 0.7)), b = ease(clamp((tl - 0.7) / 0.7));
    filOr(tl / 1.2, 860, 40);
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.font = '900 120px Georgia, serif'; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.fillText('À suivre…', W / 2, 720);
    ctx.globalAlpha = b; ctx.shadowBlur = 0; ctx.fillStyle = GOLD; ctx.font = '800 42px "Segoe UI", Arial, sans-serif'; ctx.fillText('DEMAIN', W / 2, 1000);
    ctx.fillStyle = '#fff'; ctx.font = '800 68px "Segoe UI", Arial, sans-serif'; ctx.fillText(S.demain, W / 2, 1100); ctx.restore();
  }

  // ───────────────────────── scène ─────────────────────────
  let S = null;
  function plan(t) {
    for (const sh of S.shots) if (t >= sh.start && t < sh.end) return sh;
    return S.shots[S.shots.length - 1];
  }
  function frame(t) {
    ctx.save(); ctx.clearRect(0, 0, W, H);
    if (t < S.introFin) { carteTitre(S, t, t, S.introFin); ctx.restore(); applyFinish(); return; }
    if (t >= S.finDebut) { carteFin(S, t, t - S.finDebut); ctx.restore(); applyFinish(); return; }
    const sh = plan(t), tl = t - sh.start, d = sh.end - sh.start, k = tl / d;
    // caméra : approche lente
    const z = 1 + 0.07 * ease(k), tx = (sh.index % 2 ? 1 : -1) * 18 * k;
    ctx.translate(W / 2 + tx, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    (DECORS[sh.bg] || DECORS.atelier)(t);
    teinte(sh.tint, t);
    poussieres(t, 36, 'rgba(255,230,170,1)');
    const parlant = sh.parle !== 'narration' ? sh.parle : null;
    const env = sh.env || []; const idx = Math.floor((t - sh.voixDebut) * S.fps); const talk = parlant && t >= sh.voixDebut && t < sh.voixDebut + sh.voixDuree ? clamp((env[idx] || 0) * 1.25) : 0;
    const persos = sh.persos;
    for (const p of persos) {
      const cx = W / 2 + p.x * 520, solo = persos.length === 1;
      const parle = p.id === parlant, sc = (solo ? 1.42 : 1.02) * (parle ? 1.03 : 0.97);
      const regard = persos.length > 1 ? (p.x < 0 ? 0.7 : -0.7) : Math.sin(t * 0.5) * 0.3;
      const ent = ease(clamp(tl / 0.5));
      if (!parle && parlant) ctx.filter = 'brightness(0.72)';
      perso(p.id, cx, lerp(900, 740, ent) + (solo ? 0 : 70), sc, p.emo, parle ? talk : 0, t, regard);
      ctx.filter = 'none';
    }
    ctx.restore();
    vignette(); bandeBas();
    entete(S.numero, 0.9);
    if (parlant || sh.parle === 'narration') {
      const apparait = ease(clamp((t - sh.voixDebut + 0.05) / 0.25));
      const prog = clamp((t - sh.voixDebut) / Math.max(0.3, sh.voixDuree * 0.85));
      const nom = parlant ? S.noms[parlant] : '';
      if (t >= sh.voixDebut - 0.05) sousTitre(nom, sh.texte, prog, apparait * (1 - ease(clamp((t - (sh.end - 0.25)) / 0.25))));
    }
    // fondu entre plans
    const f = Math.max(1 - clamp(tl / 0.3), clamp((tl - (d - 0.25)) / 0.25) * 0.6);
    if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f * 0.7})`; ctx.fillRect(0, 0, W, H); }
    applyFinish();
  }
  function applyFinish() {
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(grain(), 'repeat'); ctx.globalAlpha = 0.9; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  window.ADOS = {
    init(data) { S = data; S.noms = data.noms; return true; },
    frame(t) { frame(t); },
    jpeg(q) { return cv.toDataURL('image/jpeg', q); },
  };
})();
