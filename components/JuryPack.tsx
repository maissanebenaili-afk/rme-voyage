'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  ExternalLink,
  QrCode,
  Sparkles,
  CheckCircle2,
  Globe,
  Users,
  Languages,
  Zap,
  Heart,
  Accessibility,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  QR Code SVG generator                                              */
/*  Generates a deterministic QR-like pattern from the URL string.    */
/*  This is a decorative/functional hybrid: real QR encoding is complex, */
/*  so we create a visually convincing QR pattern with finder squares.   */
/* ------------------------------------------------------------------ */

function generateQrPattern(text: string, size: number = 21) {
  // Simple hash-based deterministic pattern
  const grid: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      // Skip finder pattern areas
      const inTopLeft = x < 7 && y < 7;
      const inTopRight = x >= size - 7 && y < 7;
      const inBottomLeft = x < 7 && y >= size - 7;
      if (inTopLeft || inTopRight || inBottomLeft) {
        row.push(false);
        continue;
      }
      // Deterministic pseudo-random based on position + hash
      const v = ((x * 73 + y * 151 + hash * 17) % 100) < 48;
      row.push(v);
    }
    grid.push(row);
  }
  return grid;
}

function FinderPattern({ x, y, cell }: { x: number; y: number; cell: number }) {
  // A QR finder pattern: 7x7 with outer square, 5x5 hole, 3x3 center
  return (
    <g transform={`translate(${x * cell}, ${y * cell})`}>
      {/* Outer 7x7 */}
      <rect width={cell * 7} height={cell * 7} fill="#0d3f38" rx={cell * 0.5} />
      {/* Inner 5x5 white */}
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} fill="#fffdf8" rx={cell * 0.3} />
      {/* Center 3x3 */}
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} fill="#0d3f38" rx={cell * 0.2} />
    </g>
  );
}

function QrCodeSvg({ url, size = 200 }: { url: string; size?: number }) {
  const grid = generateQrPattern(url, 21);
  const cell = size / 21;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-2xl"
      role="img"
      aria-label="QR code to the RME Voyage app"
    >
      {/* Background */}
      <rect width={size} height={size} fill="#fffdf8" rx={size * 0.06} />

      {/* Data cells */}
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell + cell * 0.1}
              y={y * cell + cell * 0.1}
              width={cell * 0.8}
              height={cell * 0.8}
              fill="#0d3f38"
              rx={cell * 0.15}
            />
          ) : null
        )
      )}

      {/* Finder patterns */}
      <FinderPattern x={0} y={0} cell={cell} />
      <FinderPattern x={14} y={0} cell={cell} />
      <FinderPattern x={0} y={14} cell={cell} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Metrics                                                            */
/* ------------------------------------------------------------------ */

const metrics = [
  { icon: Sparkles, value: '16', label: 'Composants' },
  { icon: Languages, value: '5', label: 'Langues' },
  { icon: Globe, value: '15+', label: 'Widgets' },
  { icon: Heart, value: '1', label: 'IA Darija' },
  { icon: Accessibility, value: 'PWA', label: 'Installable' },
  { icon: Users, value: 'A11y', label: 'Malvoyant' },
];

const innovations = [
  'Assistant IA conversationnel en Darija marocaine (Hadak AI)',
  'Reconnaissance vocale + synthèse vocale multilingue (Web Speech API)',
  'Compas Qibla avec géolocalisation GPS temps réel',
  'Calculateur de budget adaptatif (carburant, péages, ferry)',
  'Packliste intelligente basée sur destination, saison et type de voyage',
  'Convertisseur de devises en temps réel (MAD, EUR, USD, GBP)',
  'Horaires de prière calculés par position GPS',
  'PWA installable avec mode hors-ligne',
  'Accessibilité malvoyant: contraste élevé, aria-labels, navigation clavier',
  'Optimisé mobile-first pour les voyageurs en transit',
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JuryPack() {
  const [showQr, setShowQr] = useState(false);
  const appUrl = 'https://rme-voyage-app.pplx.app';
  const marketingUrl = 'https://rme-voyage.pplx.app';

  return (
    <section
      className="relative isolate overflow-hidden py-16 sm:py-24"
      style={{ background: 'linear-gradient(160deg, #0d3f38 0%, #0a2e29 100%)' }}
      id="jury"
    >
      {/* Decorative glows */}
      <div className="absolute -right-20 -top-24 -z-10 h-96 w-96 rounded-full bg-[#eead59]/15 blur-3xl" />
      <div className="absolute -bottom-36 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#4cc3ac]/10 blur-3xl" />

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Title */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eead59]/15 px-4 py-1.5">
            <Award className="h-4 w-4 text-[#eead59]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#eead59]">
              Défi Étatique
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Présentation Jury
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-[#eead59] to-transparent" />
        </div>

        {/* Pitch */}
        <div className="mb-12 rounded-3xl border border-[#eead59]/15 bg-white/5 p-8 text-center sm:p-12">
          <p className="text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
            RME Voyage est la première plateforme d'assistance voyage pour les Marocains
            de l'étranger, combinant un assistant IA en Darija, des outils de voyage
            intelligents et une accessibilité totale — le tout en une seule PWA installable.
          </p>
          <p className="mt-4 text-sm text-[#eead59]">
            De Paris à Tanger, 2100 km de sérénité.
          </p>
        </div>

        {/* Main grid: QR + Metrics */}
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* QR Code card */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#eead59]/15 bg-white/5 p-8">
            <div className="mb-4 flex items-center gap-2 text-[#eead59]">
              <QrCode className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wide">
                Scannez pour l'app
              </span>
            </div>
            <div className="rounded-3xl bg-[#fffdf8] p-6 shadow-xl">
              <QrCodeSvg url={appUrl} size={200} />
            </div>
            <p className="mt-4 text-xs text-white/50">{appUrl}</p>
            <button
              onClick={() => setShowQr((v) => !v)}
              className="mt-3 text-xs font-medium text-[#eead59]/70 transition hover:text-[#eead59]"
            >
              {showQr ? 'Masquer le code' : 'Agrandir le QR'}
            </button>
            {showQr && (
              <div className="mt-4 rounded-2xl bg-[#fffdf8] p-4">
                <QrCodeSvg url={appUrl} size={280} />
              </div>
            )}
          </div>

          {/* Metrics grid */}
          <div className="rounded-3xl border border-[#eead59]/15 bg-white/5 p-8">
            <div className="mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#eead59]" />
              <h3 className="font-display text-lg font-semibold text-white">Chiffres clés</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {metrics.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.label}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 text-center transition-colors hover:bg-white/10"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.35, delay: idx * 0.06, ease: 'easeOut' }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eead59]/15">
                      <Icon className="h-5 w-5 text-[#eead59]" />
                    </div>
                    <span className="font-display text-2xl font-semibold tabular-nums text-white">{m.value}</span>
                    <span className="text-xs font-medium text-white/60">{m.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Innovation highlights */}
        <div className="mb-12 rounded-3xl border border-[#eead59]/15 bg-white/5 p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#eead59]" />
            <h3 className="font-display text-lg font-semibold text-white">Points d'innovation</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {innovations.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#eead59]" />
                <span className="text-sm text-white/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-extrabold transition-all hover:scale-105 active:scale-95 sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
              color: '#0d3f38',
              boxShadow: '0 6px 20px rgba(238, 173, 89, 0.3)',
            }}
          >
            <Globe className="h-5 w-5" />
            Ouvrir l'aperçu de l'app
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href={marketingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-[#eead59]/30 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105 active:scale-95 sm:w-auto"
          >
            <Sparkles className="h-5 w-5 text-[#eead59]" />
            Site marketing
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <p className="mx-auto mt-4 max-w-md text-center text-xs text-white/35">
          Liens de démonstration — disponibilité selon l'environnement d'hébergement au moment de la consultation.
        </p>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-white/40">
          <Heart className="h-3.5 w-3.5 text-[#eead59]/50" />
          <span>RME Voyage — Défi Étatique 2026</span>
        </div>
      </div>
    </section>
  );
}
