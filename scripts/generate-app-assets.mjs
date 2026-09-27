#!/usr/bin/env node
// Builds every PNG the stores and the Android project need from the RME logo
// (the amber "R" on navy used in the site header, OG image and splash). Run after changing the logo:
//   node scripts/generate-app-assets.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BG = '#0f1f3d';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RES = path.join(ROOT, 'android/app/src/main/res');

// Logo drawing in a 192×192 box, without background.
const ART = `<text x="96" y="136" text-anchor="middle" font-family="Arial,Helvetica,DejaVu Sans,sans-serif" font-size="120" font-weight="900" fill="#f59e0b">R</text>`;

/** Logo scaled to `scale` of a `w`×`h` canvas, centred. */
function svg(w, h, { scale, background = 'none', shape = 'rect' }) {
  const size = Math.min(w, h) * scale;
  const k = size / 192;
  const x = (w - size) / 2;
  const y = (h - size) / 2;
  const bg = background === 'none' ? ''
    : shape === 'circle' ? `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2}" fill="${background}"/>`
    : shape === 'rounded' ? `<rect width="${w}" height="${h}" rx="${w * 40 / 192}" fill="${background}"/>`
    : `<rect width="${w}" height="${h}" fill="${background}"/>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg}<g transform="translate(${x} ${y}) scale(${k})">${ART}</g></svg>`);
}

async function png(file, w, h, options) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(svg(w, h, options)).png().toFile(file);
}

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

for (const [density, f] of Object.entries(DENSITIES)) {
  const dir = path.join(RES, `mipmap-${density}`);
  await png(path.join(dir, 'ic_launcher.png'), 48 * f, 48 * f, { scale: 1, background: BG, shape: 'rounded' });
  await png(path.join(dir, 'ic_launcher_round.png'), 48 * f, 48 * f, { scale: 0.9, background: BG, shape: 'circle' });
  // Adaptive icon: 108dp layer, logo inside the 66dp safe zone.
  await png(path.join(dir, 'ic_launcher_foreground.png'), 108 * f, 108 * f, { scale: 0.6 });
}

const SPLASH = {
  drawable: [480, 320],
  'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
  'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
};
for (const [dir, [w, h]] of Object.entries(SPLASH)) {
  await png(path.join(RES, dir, 'splash.png'), w, h, { scale: 0.45, background: BG });
}

const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="${BG}"/>${ART}</svg>\n`;
await writeFile(path.join(ROOT, 'public/icon-192.svg'), SVG_ICON);
await writeFile(path.join(ROOT, 'public/icon-512.svg'), SVG_ICON);
await writeFile(path.join(ROOT, 'public/icons/icon-192.svg'), SVG_ICON);
await writeFile(path.join(ROOT, 'public/icons/icon-512.svg'), SVG_ICON);

// Web / PWA icons (the manifest pointed only at SVG, which Android launchers ignore).
await png(path.join(ROOT, 'public/icons/icon-192.png'), 192, 192, { scale: 1, background: BG, shape: 'rounded' });
await png(path.join(ROOT, 'public/icons/icon-512.png'), 512, 512, { scale: 1, background: BG, shape: 'rounded' });
await png(path.join(ROOT, 'public/icons/maskable-512.png'), 512, 512, { scale: 0.8, background: BG });
await png(path.join(ROOT, 'public/apple-touch-icon.png'), 180, 180, { scale: 0.9, background: BG });

// Store listing: Play icon (512², full square, Play rounds it) and feature graphic.
const STORE = path.join(ROOT, 'play-store-listing/assets');
await png(path.join(STORE, 'play-icon-512.png'), 512, 512, { scale: 0.9, background: BG });
await mkdir(STORE, { recursive: true });
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="${BG}"/>
  <rect x="80" y="110" width="280" height="280" rx="64" fill="#f59e0b"/>
  <text x="220" y="310" text-anchor="middle" font-family="Arial,Helvetica,DejaVu Sans,sans-serif" font-size="190" font-weight="900" fill="${BG}">R</text>
  <text x="440" y="225" font-family="Arial,Helvetica,DejaVu Sans,sans-serif" font-size="72" font-weight="700" fill="#faf7ed">RME Voyage</text>
  <text x="440" y="295" font-family="Arial,Helvetica,DejaVu Sans,sans-serif" font-size="34" fill="#f59e0b">Europe ⇄ Maroc, sans stress</text>
  <text x="440" y="345" font-family="Arial,Helvetica,DejaVu Sans,sans-serif" font-size="26" fill="#faf7ed">Trajet · Prières · Budget · Assistant Hadak</text>
</svg>`)).png().toFile(path.join(STORE, 'feature-graphic-1024x500.png'));

console.log('App assets generated.');
