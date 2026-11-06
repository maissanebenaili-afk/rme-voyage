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

    dar(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#3b4a7a'], [0.3, '#e9a98a'], [0.55, '#f4dcc0'], [1, '#c9a678']]); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { arche(150 + i * 260, 1180, 220, 640, '#efe3cf'); arche(150 + i * 260, 1180, 170, 590, lin(0, 600, 0, 1180, [[0, '#f9ecd0'], [1, '#ddb98a']])); }
      ctx.fillStyle = '#d9c3a0'; ctx.fillRect(0, 1180, W, 740); zellige(0, 1180, W, 740, 110, '#c9a678', '#b8844e', '#e8d0a0');
      // fontaine
      ctx.fillStyle = '#7ba7b8'; ctx.beginPath(); ctx.ellipse(250, 1420, 190, 60, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#a9d0dc'; ctx.beginPath(); ctx.ellipse(250, 1405, 160, 40, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { const a = ((t * 1.2 + i * 0.2) % 1); ctx.beginPath(); ctx.moveTo(250, 1400); ctx.quadraticCurveTo(250 + (i - 2) * 40, 1400 - 150 * (1 - a), 250 + (i - 2) * 70, 1410); ctx.stroke(); }
      // plantes
      ctx.fillStyle = '#2f7d46'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(860 + (i % 3) * 60 - 50, 1260 + Math.floor(i / 3) * 50, 60 + (i * 11) % 40, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#e0457b'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(760 + (i * 53) % 260, 1190 + (i * 31) % 150, 9, 0, TAU); ctx.fill(); }
      // lanternes
      for (let i = 0; i < 5; i++) { const x = 120 + i * 220, y = 330 + Math.sin(t * 1.3 + i) * 10; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y); ctx.stroke(); glow(x, y + 30, 120, 'rgba(255,200,110,0.8)', 0.7 + 0.2 * Math.sin(t * 4 + i)); ctx.fillStyle = '#ffd88a'; ctx.beginPath(); ctx.ellipse(x, y + 30, 22, 34, 0, 0, TAU); ctx.fill(); }
    },
    feu(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#120404'], [0.5, '#6a1604'], [1, '#d65a0e']]); ctx.fillRect(0, 0, W, H);
      glow(W / 2, 1500, 1000, 'rgba(255,150,40,0.8)', 0.85 + 0.15 * Math.sin(t * 9));
    },

    rue(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#4aa8e8'], [0.4, '#bfe6f7'], [0.62, '#f6e6c8'], [1, '#c9b48e']]); ctx.fillRect(0, 0, W, H);
      glow(880, 240, 380, 'rgba(255,240,170,0.9)', 0.9); ctx.fillStyle = '#fff2a8'; ctx.beginPath(); ctx.arc(880, 240, 80, 0, TAU); ctx.fill();
      const cols = ['#f4b8a0', '#f2d58a', '#a8d8c8', '#e8a0b8', '#b8c8f0'], r = rng(21);
      for (let i = 0; i < 6; i++) { const x = i * 190 - 40, h = 520 + r() * 300; ctx.fillStyle = cols[i % 5]; ctx.fillRect(x, 1240 - h, 200, h); for (let k = 0; k < 4; k++) for (let j = 0; j < Math.floor(h / 150); j++) { ctx.fillStyle = 'rgba(40,60,90,0.6)'; ctx.fillRect(x + 20 + (k % 2) * 90, 1240 - h + 40 + j * 150, 60, 80); } }
      ctx.strokeStyle = '#6b4a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, 700); ctx.quadraticCurveTo(400, 780, 760, 690); ctx.stroke();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#e0457b', '#ffd84a', '#fff', '#4aa8e8', '#ff8a1f'][i]; const x = 140 + i * 130; ctx.fillRect(x, 720 + Math.sin(t * 2 + i) * 6, 70, 110); }
      ctx.fillStyle = '#b8a07a'; ctx.fillRect(0, 1240, W, 680); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(W, 1500); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, 1500, 160, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#ff8a1f'; for (const x of [150, 930]) { ctx.beginPath(); ctx.moveTo(x - 36, 1420); ctx.lineTo(x + 36, 1420); ctx.lineTo(x, 1330); ctx.closePath(); ctx.fill(); }
      oiseaux(t, 360, 5, 8);
    },
    stade(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#070b25'], [0.5, '#1a2a66'], [1, '#0e5a32']]); ctx.fillRect(0, 0, W, H);
      for (const x of [140, 940]) { glow(x, 260, 520, 'rgba(255,250,220,0.9)', 0.95); ctx.fillStyle = '#d8d8e8'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 70 + (i % 3) * 50, 190 + Math.floor(i / 3) * 40, 36, 28); ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x - 10, 290, 20, 700); }
      const r = rng(55); for (let row = 0; row < 9; row++) { const y = 700 + row * 62, c = ['#ff8a1f', '#fff4e0', '#ffb84a', '#e8e8f4'][row % 4]; ctx.fillStyle = 'rgba(8,10,34,0.9)'; ctx.fillRect(0, y - 10, W, 62); for (let x = 10 + (row % 2) * 12; x < W; x += 26) { ctx.fillStyle = r() < 0.55 ? c : '#2a3470'; ctx.globalAlpha = 0.55 + 0.4 * Math.abs(Math.sin(t * 2 + x * 0.1 + row)); ctx.beginPath(); ctx.arc(x, y + 14, 8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
      ctx.fillStyle = '#17803f'; ctx.fillRect(0, 1260, W, 660); for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 1260 + i * 95, W, 95); }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 1500); ctx.lineTo(W, 1500); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, 1500, 190, 0, TAU); ctx.stroke();
      for (let i = 0; i < 60; i++) { const q = rng(i + 4); const x = q() * W, y = ((q() * H + t * (120 + q() * 100)) % 700) + 100; ctx.fillStyle = ['#ff8a1f', '#fff', '#ffd84a'][i % 3]; ctx.globalAlpha = 0.6; ctx.fillRect(x, y, 8, 14); } ctx.globalAlpha = 1;
    },
    tribune(t) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0a0f30'], [1, '#1a2a66']]); ctx.fillRect(0, 0, W, H);
      glow(W / 2, 100, 900, 'rgba(255,250,220,0.55)', 1);
      const r = rng(66); for (let row = 0; row < 11; row++) { const y = 420 + row * 100; for (let x = -20 + (row % 2) * 40; x < W + 40; x += 80) { const sway = Math.sin(t * 3 + x * 0.05 + row) * 6; ctx.fillStyle = '#0a0d28'; ctx.beginPath(); ctx.arc(x + sway, y, 26, 0, TAU); ctx.fill(); ctx.fillRect(x - 32 + sway, y + 18, 64, 80); if (r() < 0.35) { ctx.fillStyle = r() < 0.5 ? '#ff8a1f' : '#fff4e0'; ctx.fillRect(x - 28 + sway, y + 26, 56, 18); } } }
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
    bouba: { peau: '#6b4430', ombre: '#4f2f20', cheveux: '#120b08', reflet: '#33231b', oeil: '#2a170c', haut: '#ff8a1f', haut2: '#fff4e0', style: 'afro', enfant: true, yeux: 0.98, epaule: 1.45 },
    leo: { peau: '#e3b48a', ombre: '#c4936a', cheveux: '#3a2418', reflet: '#6a4a36', oeil: '#3a5a7a', haut: '#3c8d5a', haut2: '#fff', style: 'court', enfant: true, yeux: 0.92, epaule: 1.5, lunettes: true },
    ines: { peau: '#9a6a48', ombre: '#7a4f33', cheveux: '#1a100b', reflet: '#45332a', oeil: '#3a2212', haut: '#e0457b', haut2: '#fff', style: 'macarons', enfant: true, yeux: 0.96, epaule: 1.5 },
    moussa: { peau: '#5e3b28', ombre: '#432a1c', cheveux: '#0f0a08', reflet: '#2d201a', oeil: '#26140a', haut: '#ff8a1f', haut2: '#fff4e0', style: 'court', rayures: ['#ff8a1f', '#fff4e0'], epaule: 1.9 },
    agent: { peau: '#c79a74', ombre: '#a67a56', cheveux: '#8a8a8a', reflet: '#c8c8c8', oeil: '#3a2a1c', haut: '#e8d12a', haut2: '#2a2a2a', style: 'court', rides: 1, epaule: 1.9 },
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
    if (ouv < 0.42) { // œil qui rit : un arc
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = '#140b0b'; ctx.lineWidth = 0.055 * R; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0.06 * R, 0.2 * R, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore(); return;
    }
    const k = L.yeux || 1, w = 0.235 * R * k, h = 0.3 * R * ouv * k;
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

  const COIN = { neutre: 0, joie: -0.07, triste: 0.07, colere: 0.02, surprise: 0, peur: 0.03, malade: 0.05, froid: -0.02, tendre: -0.03, pleure: 0.1 };
  const ROSE = { neutre: 0.2, joie: 0.38, triste: 0.22, colere: 0.3, surprise: 0.38, peur: 0.38, malade: 0.1, froid: 0.15, tendre: 0.38, pleure: 0.4 };
  function param(e) { const [bi, bo] = BROWS[e] || [0, 0]; return { bi, bo, ouv: OEIL[e] ?? 1, coin: COIN[e] ?? 0, rose: ROSE[e] ?? 0.2, rond: e === 'surprise' || e === 'peur' ? 1 : 0, pleure: e === 'pleure' ? 1 : 0 }; }
  function melange(a, b, k) { const A = param(a), B = param(b), o = {}; for (const c of Object.keys(A)) o[c] = lerp(A[c], B[c], k); return o; }

  function bouche(R, P, talk) {
    const y = 0.54 * R, w = 0.2 * R, ouv = clamp(talk) * 0.15 * R, coin = P.coin * R;
    ctx.save(); ctx.translate(0, y); ctx.lineCap = 'round'; ctx.lineWidth = 0.035 * R; ctx.strokeStyle = '#7a2e2e';
    if (P.rond > 0.5) { ctx.fillStyle = '#5a1c22'; ctx.beginPath(); ctx.ellipse(0, 0, 0.07 * R + ouv * 0.2, 0.07 * R + ouv * 0.8, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    else if (ouv > 3) {
      ctx.fillStyle = '#4b1620'; ctx.beginPath(); ctx.moveTo(-w, coin * 0.4); ctx.quadraticCurveTo(0, -ouv * 0.3 - coin * 0.6, w, coin * 0.4);
      ctx.quadraticCurveTo(0, ouv * 1.25 - coin * 0.2, -w, coin * 0.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6efe6'; ctx.fillRect(-w * 0.55, -ouv * 0.1, w * 1.1, ouv * 0.28);
      ctx.fillStyle = '#c4585f'; ctx.beginPath(); ctx.ellipse(0, ouv * 0.85, w * 0.45, ouv * 0.28, 0, 0, TAU); ctx.fill();
      ctx.stroke();
    } else { ctx.beginPath(); ctx.moveTo(-w, coin); ctx.quadraticCurveTo(0, -coin * 1.2 + (coin < -0.05 * R ? 0.06 * R : 0), w, coin); ctx.stroke(); }
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
    } else if (L.style === 'afro') {
      ctx.beginPath(); for (let i = 0; i < 22; i++) { const a = Math.PI * 1.05 + (i / 21) * Math.PI * 0.9; const rr = 1.22 * R + (i % 2 ? 0.06 * R : 0); ctx.lineTo(Math.cos(a) * rr * 0.98, -0.2 * R + Math.sin(a) * rr); } ctx.lineTo(0.9 * R, 0.1 * R); ctx.lineTo(-0.9 * R, 0.1 * R); ctx.closePath(); ctx.fill();
    } else if (L.style === 'macarons') {
      for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(sg * 0.72 * R, -1.02 * R, 0.46 * R, 0, TAU); ctx.fill(); }
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
    } else if (L.style === 'afro') {
      ctx.beginPath(); ctx.moveTo(-0.86 * R, -0.05 * R);
      for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; const rr = (1.0 + (i % 2 ? 0.05 : 0)) * R; ctx.lineTo(Math.cos(a) * rr * 0.9, -0.1 * R + Math.sin(a) * rr * 1.0); }
      ctx.lineTo(0.86 * R, -0.05 * R); ctx.bezierCurveTo(0.6 * R, -0.5 * R, -0.6 * R, -0.5 * R, -0.86 * R, -0.05 * R); ctx.fill();
      ctx.fillStyle = '#ff8a1f'; ctx.fillRect(-0.88 * R, -0.52 * R, 1.76 * R, 0.1 * R);
    } else if (L.style === 'macarons') {
      ctx.beginPath(); ctx.moveTo(-0.84 * R, -0.05 * R); ctx.bezierCurveTo(-0.9 * R, -1.1 * R, 0.9 * R, -1.1 * R, 0.84 * R, -0.05 * R);
      ctx.bezierCurveTo(0.6 * R, -0.5 * R, -0.6 * R, -0.5 * R, -0.84 * R, -0.05 * R); ctx.fill();
      ctx.fillStyle = '#e0457b'; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(sg * 0.55 * R, -0.78 * R, 0.1 * R, 0, TAU); ctx.fill(); }
    } else if (L.style === 'voile') {
      ctx.fillStyle = L.voile; ctx.beginPath(); ctx.moveTo(-0.86 * R, 0.25 * R); ctx.bezierCurveTo(-0.95 * R, -1.15 * R, 0.95 * R, -1.15 * R, 0.86 * R, 0.25 * R);
      ctx.bezierCurveTo(0.84 * R, -0.3 * R, 0.55 * R, -0.62 * R, 0, -0.66 * R); ctx.bezierCurveTo(-0.55 * R, -0.62 * R, -0.84 * R, -0.3 * R, -0.86 * R, 0.25 * R); ctx.fill();
      ctx.strokeStyle = L.bord || 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.03 * R; ctx.beginPath(); ctx.moveTo(-0.84 * R, 0.2 * R); ctx.bezierCurveTo(-0.82 * R, -0.3 * R, -0.55 * R, -0.6 * R, 0, -0.64 * R); ctx.bezierCurveTo(0.55 * R, -0.6 * R, 0.82 * R, -0.3 * R, 0.84 * R, 0.2 * R); ctx.stroke();
    }
  }

  function epaules(R, L, id) {
    ctx.fillStyle = L.haut; ctx.beginPath(); const E = L.epaule || 1.9; ctx.moveTo(-E * R, 7 * R); ctx.bezierCurveTo(-E * R, 1.55 * R, -1.1 * R, 1.3 * R, -0.45 * R, 1.12 * R);
    ctx.lineTo(0.45 * R, 1.12 * R); ctx.bezierCurveTo(1.1 * R, 1.3 * R, E * R, 1.55 * R, E * R, 7 * R); ctx.closePath(); ctx.fill();
    if (L.rayures) { ctx.save(); ctx.clip(); for (let i = -6; i < 6; i++) { ctx.fillStyle = i % 2 ? L.rayures[1] : L.rayures[0]; ctx.fillRect(i * 0.34 * R, 1 * R, 0.34 * R, 6 * R); } ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-2 * R, 1 * R, 4 * R, 0.14 * R); ctx.restore(); }
    ctx.fillStyle = L.haut2; ctx.globalAlpha = 0.9;
    if (id === 'ghita' || id === 'reda') { ctx.beginPath(); ctx.moveTo(-0.45 * R, 1.1 * R); ctx.lineTo(0, 1.55 * R); ctx.lineTo(0.45 * R, 1.1 * R); ctx.lineTo(0.3 * R, 1.05 * R); ctx.lineTo(0, 1.3 * R); ctx.lineTo(-0.3 * R, 1.05 * R); ctx.fill(); }
    else if (id === 'idriss') { ctx.beginPath(); ctx.ellipse(0, 1.2 * R, 0.55 * R, 0.2 * R, 0, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-0.4 * R, 1.1 * R); ctx.quadraticCurveTo(0, 1.55 * R, 0.4 * R, 1.1 * R); ctx.lineTo(0.3 * R, 1.08 * R); ctx.quadraticCurveTo(0, 1.35 * R, -0.3 * R, 1.08 * R); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (L.patch) { ctx.fillStyle = '#9b7a4e'; ctx.fillRect(0.7 * R, 1.8 * R, 0.4 * R, 0.4 * R); ctx.strokeStyle = '#f2e2bb'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(0.7 * R, 1.8 * R, 0.4 * R, 0.4 * R); ctx.setLineDash([]); }
    if (L.broche) { glow(-0.75 * R, 1.8 * R, 60, 'rgba(255,215,120,0.9)', 0.9); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(-0.75 * R, 1.8 * R, 0.09 * R, 0, TAU); ctx.fill(); }
    if (L.perles) { ctx.fillStyle = '#f7f1e4'; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.arc(i * 0.1 * R, 1.17 * R + Math.abs(i) * 0.03 * R + 0.22 * R * (1 - Math.cos(i * 0.4)), 0.05 * R, 0, TAU); ctx.fill(); } }
  }

  function bras(R, L, sx, sy, hx, hy, pose, t) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = L.haut; ctx.lineWidth = 0.62 * R; ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + hx) / 2 + (hx > sx ? 0.18 * R : -0.18 * R), (sy + hy) / 2 + 0.4 * R, hx, hy + 0.1 * R); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.08 * R; ctx.beginPath(); ctx.moveTo(hx - 0.2 * R, hy + 0.2 * R); ctx.lineTo(hx + 0.2 * R, hy + 0.2 * R); ctx.stroke();
    ctx.fillStyle = L.peau; ctx.strokeStyle = L.ombre; ctx.lineWidth = 0.025 * R;
    if (pose === 'poing') {
      rectRondeMain(hx, hy, 0.34 * R, 0.3 * R); ctx.strokeStyle = 'rgba(80,40,20,0.5)'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(hx + i * 0.09 * R, hy - 0.14 * R); ctx.lineTo(hx + i * 0.09 * R, hy + 0.02 * R); ctx.stroke(); }
    } else {
      ctx.beginPath(); ctx.ellipse(hx, hy, 0.17 * R, 0.19 * R, 0, 0, TAU); ctx.fill();
      for (let i = -2; i <= 1; i++) { ctx.save(); ctx.translate(hx + (i + 0.5) * 0.085 * R, hy - 0.14 * R); ctx.rotate((i + 0.5) * 0.18); ctx.beginPath(); ctx.ellipse(0, -0.09 * R, 0.04 * R, 0.12 * R, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    }
    ctx.restore();
  }
  function rectRondeMain(cx, cy, w, h) { const r = Math.min(w, h) * 0.4; ctx.beginPath(); ctx.moveTo(cx - w / 2 + r, cy - h / 2); ctx.arcTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, r); ctx.arcTo(cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2, r); ctx.arcTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2, r); ctx.arcTo(cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, r); ctx.closePath(); ctx.fill(); ctx.stroke(); }

  // I : { emoA, emoB, k, act, tl, d, talk, t, regard, dir, ent }
  function perso(id, cx, cy, sc, I) {
    const L = LOOKS[id]; if (!L) return;
    const R = 175, t = I.t, tl = I.tl, dir = I.dir;
    const P = melange(I.emoA, I.emoB || I.emoA, I.k || 0);
    const emo = (I.k || 0) > 0.5 ? (I.emoB || I.emoA) : I.emoA;
    // gestes
    let dx = 0, dy = 0, rot = 0, esc = 1, pose = null, talk = I.talk, joue = 0;
    const montee = ease(clamp(tl / 0.45));
    switch (I.act) {
      case 'rire': P.ouv = Math.min(P.ouv, 0.3); P.coin = -0.09; talk = Math.max(talk, 0.55 + 0.45 * Math.abs(Math.sin(t * 11))); dy = -Math.abs(Math.sin(t * 11)) * 14; rot = Math.sin(t * 8.5) * 0.03; esc = 1.01; break;
      case 'secoue': rot = Math.sin(t * 15) * 0.05; dx = Math.sin(t * 15) * 9; break;
      case 'poing': pose = 'poing'; esc = 1 + 0.04 * montee; dy = -8 * montee; rot = dir * 0.03 * montee; break;
      case 'tend': pose = 'tend'; dx = dir * 0.1 * R * montee; rot = dir * 0.035 * montee; break;
      case 'coeur': pose = 'coeur'; rot = -dir * 0.03 * montee; dy = 6 * montee; break;
      case 'bouche': pose = 'bouche'; esc = 1 + 0.02 * montee; break;
      case 'baisse': dy = 0.2 * R * montee; rot = -dir * 0.05 * montee; P.ouv *= 0.8; break;
      case 'recule': dx = -dir * 0.5 * R * (1 - Math.exp(-tl * 6)); esc = 0.95; break;
      case 'avance': dx = dir * 0.32 * R * montee; esc = 1 + 0.07 * montee; break;
      case 'choc': { const e = Math.exp(-Math.max(0, tl - 0.12) * 4.5), a = clamp(tl / 0.12); dx = -dir * 0.62 * R * e * a; rot = -dir * 0.14 * e * a; joue = e * a; P.ouv = Math.max(P.ouv, 1.15); break; }
      default: break;
    }
    dy += -talk * 6 + Math.sin(t * 1.7 + id.length) * 3;
    rot += Math.sin(t * 0.9 + id.length) * 0.008 + (talk > 0.3 ? Math.sin(t * 7) * 0.012 : 0);
    ctx.save(); ctx.translate(cx + dx * sc + (1 - I.ent) * -dir * 50, cy + dy * sc); ctx.scale(sc * esc, sc * esc * (1 + Math.sin(t * 1.6) * 0.004));
    ctx.translate(0, 1.3 * R); ctx.rotate(rot); ctx.translate(0, -1.3 * R);
    glow(0, 1.3 * R, 360, 'rgba(0,0,0,0.5)', 0.35);
    cheveuxArriere(R, L);
    ctx.fillStyle = L.ombre; ctx.fillRect(-0.28 * R, 0.8 * R, 0.56 * R, 0.5 * R);
    epaules(R, L, id);
    ctx.fillStyle = lin(-R, -R, R, R, [[0, L.peau], [1, L.ombre]]); ovale(R); ctx.fill();
    ctx.save(); ovale(R); ctx.clip();
    ctx.fillStyle = lin(-0.2 * R, 0, R, 0, [[0, 'rgba(60,20,10,0)'], [1, 'rgba(60,20,10,0.2)']]); ctx.fillRect(-R, -1.2 * R, 2 * R, 2.4 * R);
    ctx.restore();
    glow(-0.5 * R, 0.32 * R, 0.3 * R, 'rgba(235,100,110,0.9)', P.rose); glow(0.5 * R, 0.32 * R, 0.3 * R, 'rgba(235,100,110,0.9)', P.rose);
    if (joue > 0.02) glow(dir * 0.5 * R, 0.28 * R, 0.34 * R, 'rgba(220,40,40,0.95)', 0.75 * joue);
    ctx.strokeStyle = 'rgba(100,50,30,0.5)'; ctx.lineWidth = 0.03 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-0.03 * R, 0.2 * R); ctx.quadraticCurveTo(0.06 * R, 0.34 * R, -0.03 * R, 0.37 * R); ctx.stroke();
    const cycle = (t * 0.28 + id.length * 0.37) % 1; const clin = cycle > 0.96 ? 1 - Math.sin((cycle - 0.96) / 0.04 * Math.PI) * 0.95 : 1;
    const ouv = P.ouv * clin, rg = I.regard;
    oeil(-0.38 * R, 0.1 * R, R, L, ouv, rg, -1, t, emo); oeil(0.38 * R, 0.1 * R, R, L, ouv, rg, 1, t, emo);
    ctx.strokeStyle = L.cheveux === '#ddd' ? '#aaa' : L.cheveux; ctx.lineWidth = 0.055 * R; ctx.lineCap = 'round';
    const by = -0.27 * R, bi = P.bi, bo = P.bo;
    ctx.beginPath(); ctx.moveTo(-0.58 * R, by + bo * 0.5); ctx.quadraticCurveTo(-0.38 * R, by - 0.06 * R + bi * 0.3, -0.16 * R, by + bi * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.58 * R, by + bo * 0.5); ctx.quadraticCurveTo(0.38 * R, by - 0.06 * R + bi * 0.3, 0.16 * R, by + bi * 0.9); ctx.stroke();
    if (L.cicatrice) {
      ctx.save(); ctx.strokeStyle = '#a2584a'; ctx.lineWidth = 0.042 * R; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-0.52 * R, -0.42 * R); ctx.quadraticCurveTo(-0.62 * R, -0.05 * R, -0.5 * R, 0.4 * R); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,215,195,0.55)'; ctx.lineWidth = 0.02 * R; ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.42 * R); ctx.quadraticCurveTo(-0.6 * R, -0.05 * R, -0.48 * R, 0.4 * R); ctx.stroke();
      ctx.restore();
    }
    if (L.cicatriceMenton) { ctx.strokeStyle = '#8f4a3a'; ctx.lineWidth = 0.035 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0.2 * R, 0.78 * R); ctx.lineTo(0.38 * R, 0.9 * R); ctx.stroke(); }
    if (L.rides) { ctx.strokeStyle = 'rgba(90,50,30,0.35)'; ctx.lineWidth = 0.018 * R; for (let k = 0; k < 2 + L.rides; k++) { ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.1 * R + k * 0.06 * R); ctx.quadraticCurveTo(-0.3 * R, -0.14 * R + k * 0.06 * R, -0.12 * R, -0.1 * R + k * 0.06 * R); ctx.stroke(); } }
    if (L.lunettes) { ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 0.045 * R; for (const sg of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sg * 0.38 * R, 0.1 * R, 0.3 * R, 0.29 * R, 0, 0, TAU); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-0.08 * R, 0.08 * R); ctx.lineTo(0.08 * R, 0.08 * R); ctx.stroke(); }
    bouche(R, P, talk);
    if (P.pleure > 0.4) {
      for (const sg of [-1, 1]) {
        const ph = (t * 0.7 + (sg > 0 ? 0.3 : 0)) % 1, len = 0.2 * R + ph * 0.9 * R;
        ctx.strokeStyle = 'rgba(200,230,255,0.85)'; ctx.lineWidth = 0.035 * R; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sg * 0.36 * R, 0.28 * R); ctx.quadraticCurveTo(sg * 0.4 * R, 0.4 * R + len * 0.4, sg * 0.38 * R, 0.28 * R + len); ctx.stroke();
        ctx.fillStyle = 'rgba(230,245,255,0.95)'; ctx.beginPath(); ctx.arc(sg * 0.38 * R, 0.28 * R + len, 0.04 * R, 0, TAU); ctx.fill();
      }
    }
    cheveuxAvant(R, L, t);
    // mains : par-dessus le visage et les cheveux
    if (pose) {
      const sx = (pose === 'coeur' ? -dir : dir) * 1.3 * R, sy = 1.7 * R, bob = Math.sin(t * 3) * 0.04 * R;
      if (pose === 'poing') bras(R, L, sx, sy, dir * 0.95 * R, 0.95 * R + Math.sin(t * 18) * 0.03 * R, 'poing', t);
      if (pose === 'tend') bras(R, L, sx, sy, dir * 1.95 * R, 1.3 * R + bob, 'main', t);
      if (pose === 'coeur') bras(R, L, sx, sy, -dir * 0.2 * R, 1.5 * R + bob * 0.5, 'main', t);
      if (pose === 'bouche') bras(R, L, sx, sy, dir * 0.02 * R, 0.66 * R, 'main', t);
    }
    ctx.restore();
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
    ctx.font = '900 34px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = GOLD; ctx.textAlign = 'left'; ctx.fillText((S.titreSerie || 'Le Fil d’or').toUpperCase(), 54, 96);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText((S.etiquette || 'ÉPISODE') + ' ' + ep, W - 54, 96);
    ctx.restore();
  }
  function filOr(prog, y, amp) {
    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.shadowColor = GOLD; ctx.shadowBlur = 24; ctx.beginPath();
    const n = Math.floor(120 * clamp(prog)); for (let i = 0; i <= n; i++) { const x = 90 + (i / 120) * (W - 180); const yy = y + Math.sin(i / 120 * TAU * 1.5) * amp; if (i) ctx.lineTo(x, yy); else ctx.moveTo(x, yy); }
    ctx.stroke(); ctx.restore();
  }
  function carteTitre(S, t, tl, dur) {
    tl *= 1.75; // titre en 1,6 s
    ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0a0614'], [0.5, '#2a1238'], [1, '#0a0614']]); ctx.fillRect(0, 0, W, H);
    glow(W / 2, 900, 700, 'rgba(242,193,78,0.35)', 1); poussieres(t, 40, '#ffe9a8');
    const a = ease(clamp(tl / 0.8)), b = ease(clamp((tl - 0.6) / 0.8)), c = ease(clamp((tl - 1.3) / 0.7));
    filOr(tl / 1.4, 780, 60);
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a; ctx.fillStyle = '#fff';
    ctx.font = '900 150px Georgia, "Times New Roman", serif'; ctx.shadowColor = GOLD; ctx.shadowBlur = 40; ctx.fillText(S.titreSerie || 'Le Fil d’or', W / 2, 640);
    ctx.globalAlpha = b; ctx.shadowBlur = 0; ctx.font = '800 44px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = GOLD; ctx.fillText((S.etiquette || 'ÉPISODE') + ' ' + S.numero, W / 2, 980);
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
    ctx.fillStyle = '#fff'; ctx.font = '800 68px "Segoe UI", Arial, sans-serif'; ctx.fillText(S.demain, W / 2, 1100);
    if (S.question) { ctx.globalAlpha = ease(clamp((tl - 1.4) / 0.7)); ctx.fillStyle = GOLD; ctx.font = 'italic 800 46px Georgia, serif'; ctx.fillText(S.question, W / 2, 1290); }
    ctx.globalAlpha = ease(clamp((tl - 2.0) / 0.6)); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 44px "Segoe UI", Arial, sans-serif'; ctx.fillText('Abonne-toi pour la suite', W / 2, 1480); ctx.restore();
  }


  // ───────────────────────── plans d'insertion ─────────────────────────
  function flamme(x, base, h, w, t, i) {
    const f = 0.8 + 0.2 * Math.sin(t * 10 + i * 1.7), hh = h * f, sway = Math.sin(t * 6 + i) * w * 0.25;
    ctx.fillStyle = lin(0, base - hh, 0, base, [[0, '#fff2a8'], [0.35, '#ffb02e'], [0.75, '#e2521b'], [1, '#7a1604']]);
    ctx.beginPath(); ctx.moveTo(x - w, base); ctx.bezierCurveTo(x - w * 1.1, base - hh * 0.4, x - w * 0.2 + sway, base - hh * 0.7, x + sway, base - hh);
    ctx.bezierCurveTo(x + w * 0.2 + sway, base - hh * 0.7, x + w * 1.1, base - hh * 0.4, x + w, base); ctx.closePath(); ctx.fill();
  }
  const INSERTS = {
    feu(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#100303'], [0.5, '#6a1604'], [1, '#d65a0e']]); ctx.fillRect(0, 0, W, H);
      glow(W / 2, 1400, 1100, 'rgba(255,150,40,0.85)', 0.85 + 0.15 * Math.sin(t * 9));
      // la silhouette d'une femme qui porte un enfant
      ctx.fillStyle = '#0a0302'; ctx.beginPath(); ctx.arc(500, 880, 74, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(400, 1500); ctx.bezierCurveTo(400, 1180, 430, 1000, 500, 980); ctx.bezierCurveTo(580, 1000, 640, 1180, 660, 1500); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(610, 1010, 44, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(600, 1110, 56, 74, 0.2, 0, TAU); ctx.fill();
      for (let i = 0; i < 14; i++) flamme(40 + i * 78, H + 40, 640 + (i % 4) * 140, 90, t, i);
      for (let i = 0; i < 40; i++) { const r = rng(i + 3); const x = (r() * W + Math.sin(t * 2 + i) * 30), y = H - ((t * (80 + r() * 160) + r() * H) % H); ctx.fillStyle = `rgba(255,${160 + (r() * 80) | 0},60,${0.4 + 0.4 * r()})`; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 4, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.font = '800 90px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,230,160,0.55)';
      for (let i = 0; i < 3; i++) { const y = 700 - ((t * 60 + i * 120) % 360); ctx.globalAlpha = clamp(1 - (700 - y) / 360) * 0.7; ctx.fillText(i % 2 ? '♪' : '♫', 760 + Math.sin(t * 2 + i) * 40, y); }
      ctx.restore();
    },
    lettre(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#2a1810'], [1, '#5a3a22']]); ctx.fillRect(0, 0, W, H);
      glow(W / 2, 900, 800, 'rgba(255,215,140,0.45)', 1);
      ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(-0.08 + Math.sin(t * 1.2) * 0.012);
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 30; ctx.fillStyle = '#f3e6c8'; ctx.fillRect(-330, -220, 660, 440); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#d7c08c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-330, -220); ctx.lineTo(0, 30); ctx.lineTo(330, -220); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,90,50,0.6)'; ctx.lineWidth = 7; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-200, 100 + i * 36); ctx.quadraticCurveTo(0, 90 + i * 36, 200 - i * 40, 110 + i * 36); ctx.stroke(); }
      const sc = 1 + 0.04 * Math.sin(t * 3); ctx.save(); ctx.translate(0, 30); ctx.scale(sc, sc);
      ctx.fillStyle = rad(0, 0, 0, 80, [[0, '#ffe08a'], [1, '#b8860b']]); ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fill(); etoile8(0, 0, 54, '#8a5a08'); etoile8(0, 0, 36, '#ffd86a'); ctx.restore();
      const sw = ((t * 0.5) % 1.6) * 1500 - 400; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(sw, -240); ctx.lineTo(sw + 80, -240); ctx.lineTo(sw - 120, 240); ctx.lineTo(sw - 200, 240); ctx.closePath(); ctx.fill();
      ctx.restore(); poussieres(t, 40, '#ffe9a8');
    },
    broderie(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#2a1810'], [1, '#4a2c1a']]); ctx.fillRect(0, 0, W, H);
      glow(W / 2, 880, 900, 'rgba(255,200,120,0.4)', 1);
      ctx.fillStyle = '#8e1f3a'; ctx.beginPath(); ctx.arc(W / 2, 900, 380, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#9a6a3a'; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(W / 2, 900, 400, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#c99a5a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(W / 2, 900, 424, 0, TAU); ctx.stroke();
      const prog = clamp(k * 1.15), n = 8, cur = prog * n;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU - Math.PI / 2, f = clamp(cur - i); if (f <= 0) continue;
        ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(a); ctx.shadowColor = GOLD; ctx.shadowBlur = 24; ctx.fillStyle = lin(0, 0, 0, -230, [[0, '#b8860b'], [0.6, GOLD], [1, '#fff0b0']]);
        ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(-70 * f, -100 * f, -60 * f, -200 * f, 0, -240 * f); ctx.bezierCurveTo(60 * f, -200 * f, 70 * f, -100 * f, 0, -30); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#fff0b0'; ctx.beginPath(); ctx.arc(W / 2, 900, 36 * clamp(prog * 2), 0, TAU); ctx.fill();
      const ia = Math.floor(clamp(cur, 0, n - 0.001)), ang = (ia / n) * TAU - Math.PI / 2, rr = 130 + 70 * (cur % 1), nx = W / 2 + Math.cos(ang) * rr, ny = 900 + Math.sin(ang) * rr;
      glow(nx, ny, 90, 'rgba(255,230,140,1)', 0.9); ctx.strokeStyle = '#d9d9e6'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(nx + 90, ny - 220); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.quadraticCurveTo(nx + 200, ny - 200, W - 60, 120 + Math.sin(t * 2) * 20); ctx.stroke();
      poussieres(t, 30, '#ffe9a8');
    },
    broche(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0b1538'], [1, '#1c2c6a']]); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, i * 32, W, 2); }
      const pul = 1 + 0.03 * Math.sin(t * 2.4) + 0.12 * k;
      glow(W / 2, 880, 800, 'rgba(255,215,120,0.55)', 1);
      ctx.save(); ctx.translate(W / 2, 880); ctx.scale(pul, pul);
      for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate((i / 8) * TAU); ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.fillStyle = lin(0, 0, 0, -260, [[0, '#b8860b'], [0.6, GOLD], [1, '#fff0b0']]); ctx.beginPath(); ctx.moveTo(0, -40); ctx.bezierCurveTo(-90, -120, -80, -230, 0, -270); ctx.bezierCurveTo(80, -230, 90, -120, 0, -40); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = rad(0, 0, 0, 70, [[0, '#ff7a9a'], [1, '#8a0f33']]); ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.fill(); ctx.restore();
      const sw = ((t * 0.45) % 1.7) * 1500 - 300; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(sw, 300); ctx.lineTo(sw + 70, 300); ctx.lineTo(sw - 130, 1500); ctx.lineTo(sw - 200, 1500); ctx.closePath(); ctx.fill();
      poussieres(t, 30, '#ffe9a8');
    },
    robe(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#120816'], [1, '#2a1030']]); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,230,170,0.22)'; ctx.beginPath(); ctx.moveTo(W / 2 - 60, 0); ctx.lineTo(W / 2 + 60, 0); ctx.lineTo(W / 2 + 520, 1700); ctx.lineTo(W / 2 - 520, 1700); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lin(0, 520, 0, 1720, [[0, '#fff0b0'], [0.4, GOLD], [1, '#8a5a08']]);
      ctx.beginPath(); ctx.moveTo(W / 2 - 110, 560); ctx.lineTo(W / 2 + 110, 560); ctx.lineTo(W / 2 + 70, 800); ctx.bezierCurveTo(W / 2 + 330, 1100, W / 2 + 500, 1500, W / 2 + 440, 1720); ctx.lineTo(W / 2 - 440, 1720); ctx.bezierCurveTo(W / 2 - 500, 1500, W / 2 - 330, 1100, W / 2 - 70, 800); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 4; for (let i = 0; i < 18; i++) { const x = W / 2 + (((i * 97) % 700) - 350), y = 900 + ((i * 53) % 700); ctx.beginPath(); for (let a = 0; a < 6; a++) { const q = (a / 6) * TAU; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(q) * 22, y + Math.sin(q) * 22); } ctx.stroke(); }
      for (let i = 0; i < 70; i++) { const r = rng(i + 9); const x = W / 2 + (r() - 0.5) * 900, y = 500 + r() * 1200; glow(x, y, 20 + r() * 30, '#fff3c2', 0.2 + 0.7 * Math.abs(Math.sin(t * 2 + i))); }
    },

    ballon(t, k) {
      DECORS.rue(t);
      const x = lerp(-120, W + 120, ease(k)), y = 1240 - Math.abs(Math.sin(t * 5)) * 340, a = t * 9;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, 1330, 90 - (1240 - y) * 0.06, 20, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 10; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 140 - i * 70, y + i * 12 - 20); ctx.lineTo(x - 90 - i * 70, y + i * 12 - 20); ctx.stroke(); }
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fill(); ctx.fillStyle = '#222'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate((i / 5) * TAU); ctx.beginPath(); for (let q = 0; q < 5; q++) { const aa = (q / 5) * TAU; ctx.lineTo(Math.cos(aa) * 26, -52 + Math.sin(aa) * 26); } ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.strokeStyle = '#ddd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.stroke(); ctx.restore();
    },
    but(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#0a0f30'], [1, '#17803f']]); ctx.fillRect(0, 0, W, H);
      const bulge = Math.exp(-k * 3) * 120 * Math.sin(k * 22 + 1);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
      for (let i = 0; i <= 18; i++) { const x = 80 + i * 55, d = bulge * Math.exp(-Math.pow((x - W / 2) / 260, 2)); ctx.beginPath(); ctx.moveTo(x, 420); ctx.quadraticCurveTo(x + d * 0.3, 900 + d, x, 1500); ctx.stroke(); }
      for (let j = 0; j <= 14; j++) { const y = 420 + j * 77; ctx.beginPath(); for (let i = 0; i <= 18; i++) { const x = 80 + i * 55, d = bulge * Math.exp(-Math.pow((x - W / 2) / 260, 2)) * (1 - Math.abs(y - 960) / 700); i ? ctx.lineTo(x, y + d * 0.5) : ctx.moveTo(x, y + d * 0.5); } ctx.stroke(); }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(60, 1500); ctx.lineTo(60, 420); ctx.lineTo(W - 60, 420); ctx.lineTo(W - 60, 1500); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(W / 2, 980 + bulge * 0.3, 70, 0, TAU); ctx.fill();
      for (let i = 0; i < 120; i++) { const q = rng(i + 7); const vx = (q() - 0.5) * 900, vy = -200 - q() * 900, tt = k * 3; const x = W / 2 + vx * tt * 0.6, y = 700 + vy * tt * 0.6 + 900 * tt * tt * 0.5; ctx.fillStyle = ['#ff8a1f', '#fff', '#ffd84a', '#e0457b'][i % 4]; ctx.save(); ctx.translate(x, y); ctx.rotate(tt * 6 + i); ctx.fillRect(-9, -5, 18, 10); ctx.restore(); }
    },
    calendrier(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#2a2418'], [1, '#4a3d28']]); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, 900); ctx.rotate(0.02); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.fillStyle = '#f7f2e6'; ctx.fillRect(-400, -520, 800, 1040); ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#c0392b'; ctx.fillRect(-400, -520, 800, 150); ctx.fillStyle = '#fff'; ctx.font = '900 80px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3 SEMAINES', 0, -445);
      const cur = Math.floor(21 * ease(clamp(k * 1.1)));
      for (let i = 0; i < 21; i++) { const cx = -300 + (i % 7) * 100, cy = -280 + Math.floor(i / 7) * 190; ctx.fillStyle = '#e9e1cf'; ctx.fillRect(cx - 42, cy - 42, 84, 84); ctx.fillStyle = '#3a3226'; ctx.font = '800 38px Arial'; ctx.fillText(String(i + 1), cx, cy);
        if (i < cur) { ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx - 36, cy - 36); ctx.lineTo(cx + 36, cy + 36); ctx.moveTo(cx + 36, cy - 36); ctx.lineTo(cx - 36, cy + 36); ctx.stroke(); } }
      const pu = 0.5 + 0.5 * Math.sin(t * 6); ctx.strokeStyle = `rgba(200,30,30,${0.4 + 0.5 * pu})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(-300 + 6 * 100, -280 + 2 * 190, 56, 0, TAU); ctx.stroke(); ctx.restore();
    },
    maison(t, k) {
      ctx.fillStyle = lin(0, 0, 0, H, [[0, '#070a22'], [1, '#1a2450']]); ctx.fillRect(0, 0, W, H);
      const eclair = Math.sin(t * 0.9) * Math.sin(t * 2.3) > 0.9; if (eclair) { ctx.fillStyle = 'rgba(210,225,255,0.45)'; ctx.fillRect(0, 0, W, H); }
      ctx.fillStyle = '#e6e0d4'; ctx.fillRect(190, 780, 700, 640); ctx.fillStyle = '#3a3a4a'; ctx.beginPath(); ctx.moveTo(150, 780); ctx.lineTo(540, 600); ctx.lineTo(930, 780); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(470, 640); ctx.lineTo(510, 720); ctx.lineTo(480, 780); ctx.stroke();
      arche(540, 1420, 160, 280, '#2a1f18'); glow(330, 1000, 200, 'rgba(255,200,120,0.9)', 0.9); ctx.fillStyle = '#ffd88a'; ctx.fillRect(290, 960, 80, 100); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(326, 960, 8, 100); ctx.fillRect(290, 1006, 80, 8);
      ctx.fillStyle = '#0c1020'; ctx.fillRect(0, 1420, W, 500);
    },
  };

  // ───────────────────────── caméra et effets ─────────────────────────
  function camera(sh, k, t) {
    let z = 1 + 0.06 * ease(k), tx = 0, ty = 0, rot = 0;
    switch (sh.cam) {
      case 'fixe': z = 1; break;
      case 'push': z = 1 + 0.24 * ease(Math.min(1, k * 1.25)); ty = -40 * ease(k); break;
      case 'pan': z = 1.1; tx = lerp(-55, 55, ease(k)); break;
      case 'shake': { z = 1.08 + 0.08 * k; const a = 16 * Math.exp(-k * 2.2); tx = Math.sin(t * 47) * a; ty = Math.cos(t * 39) * a; rot = Math.sin(t * 31) * a * 0.0007; break; }
      default: break;
    }
    tx += Math.sin(t * 0.9) * 5; ty += Math.cos(t * 0.7) * 4;
    ctx.translate(W / 2 + tx, H / 2 + ty); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  }
  // Le côté « feuilleton » : pétales qui tombent, lueur douce, rayons derrière les larmes.
  function kitsch(t, intense, joie) {
    const r = rng(4242); ctx.save();
    for (let i = 0; i < 16; i++) {
      const x = (r() * W + Math.sin(t * 0.8 + i) * 60) % W, y = ((r() * H + t * (60 + r() * 50)) % (H + 80)) - 40, s = 10 + r() * 16, a = t * 1.4 + i;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = 0.5; ctx.fillStyle = joie ? '#ffd1e3' : 'rgba(255,225,170,0.85)';
      ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (intense) { // rayons style années 80 derrière le visage
      ctx.globalAlpha = 0.16 + 0.06 * Math.sin(t * 3); ctx.translate(W / 2, 760);
      for (let i = 0; i < 18; i++) { ctx.rotate(TAU / 18); ctx.fillStyle = i % 2 ? 'rgba(255,240,200,0.9)' : 'rgba(255,200,230,0.0)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -1400); ctx.lineTo(60, -1400); ctx.closePath(); ctx.fill(); }
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rad(W / 2, 760, 100, 900, [[0, 'rgba(255,220,240,0.10)'], [1, 'rgba(255,200,160,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
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
    camera(sh, k, t);
    (DECORS[sh.bg] || DECORS.atelier)(t);
    teinte(sh.tint, t);
    if (sh.insert && INSERTS[sh.insert]) INSERTS[sh.insert](t, k);
    else poussieres(t, 36, 'rgba(255,230,170,1)');
    const parlant = sh.parle && sh.parle !== 'narration' ? sh.parle : null;
    const env = sh.env || []; const idx = Math.floor((t - sh.voixDebut) * S.fps);
    const parle = (id) => id === parlant && t >= sh.voixDebut && t < sh.voixDebut + sh.voixDuree;
    const persos = sh.persos || [];
    const sentimental = persos.some((p) => p.emo === 'pleure' || p.emo2 === 'pleure' || p.emo === 'tendre');
    if (!sh.insert && persos.length) kitsch(t, sentimental && sh.cam === 'push', persos.some((p) => p.emo === 'joie'));
    for (const p of persos) {
      const solo = persos.length === 1, cx = W / 2 + p.x * (persos.length > 2 ? 400 : 520), dir = solo ? 1 : p.x < 0 ? 1 : -1;
      const parlePerso = p.id === parlant, sc = (solo ? 1.42 : persos.length > 2 ? 0.9 : 1.02) * (parlePerso ? 1.03 : 0.97);
      const talk = parle(p.id) ? clamp((env[idx] || 0) * 1.25) : 0;
      const kEmo = p.emo2 ? ease(clamp((tl - 0.45 * d) / (0.3 * d))) : 0;
      const ent = ease(clamp(tl / 0.5));
      const regard = solo ? Math.sin(t * 0.5) * 0.3 : p.x < 0 ? 0.7 : -0.7;
      if (!parlePerso && parlant) ctx.filter = 'brightness(0.74)';
      perso(p.id, cx, lerp(900, 740, ent) + (solo ? 0 : 70), sc, { emoA: p.emo, emoB: p.emo2, k: kEmo, act: p.act, tl, d, talk, t, regard, dir, ent });
      ctx.filter = 'none';
    }
    ctx.restore();
    vignette(); bandeBas();
    entete(S.numero, 0.9);
    if (sh.parle) {
      const apparait = ease(clamp((t - sh.voixDebut + 0.05) / 0.25));
      // le texte suit la voix : avance d'environ 0,1 s sur elle pour qu'on lise avant d'entendre
      const k = Math.floor((t - sh.voixDebut) * S.fps) + 2;
      const prog = sh.suivi ? (k < 0 ? 0 : sh.suivi[Math.min(k, sh.suivi.length - 1)]) : clamp((t - sh.voixDebut) / Math.max(0.3, sh.voixDuree * 0.85));
      const nom = parlant ? S.noms[parlant] : '';
      if (t >= sh.voixDebut - 0.05) sousTitre(nom, sh.texte, prog, apparait * (1 - ease(clamp((t - (sh.end - 0.25)) / 0.25))));
    }
    if ((sh.fx || []).includes('flash')) { const a = Math.exp(-tl * 7); if (a > 0.02) { ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`; ctx.fillRect(0, 0, W, H); } }
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
