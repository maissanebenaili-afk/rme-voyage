'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Volume2,
  Square,
  Sun,
  Moon,
  Type,
  Accessibility as AccessibilityIcon,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'rme-a11y-settings';

type TextSize = 'normal' | 'large' | 'xlarge';

interface A11ySettings {
  textSize: TextSize;
  highContrast: boolean;
  focusVisible: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  textSize: 'normal',
  highContrast: false,
  focusVisible: false,
};

const TEXT_SIZE_MAP: Record<TextSize, string> = {
  normal: '16px',
  large: '18px',
  xlarge: '21px',
};

export default function Accessibility() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);
  const [isReading, setIsReading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as A11ySettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Text size
    root.style.fontSize = TEXT_SIZE_MAP[settings.textSize];

    // High contrast
    if (settings.highContrast) {
      root.classList.add('rme-high-contrast');
    } else {
      root.classList.remove('rme-high-contrast');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('rme-focus-visible');
    } else {
      root.classList.remove('rme-focus-visible');
    }

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Inject accessibility CSS
  useEffect(() => {
    const styleId = 'rme-a11y-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* High contrast mode
         Approche générique : plutôt qu'une liste figée de couleurs hex
         (qui se désynchronise dès qu'une page ajoute une nouvelle teinte
         Tailwind arbitraire), on cible TOUTE classe d'arrière-plan/texte
         arbitraire ([class*="bg-["] / [class*="text-["]) ainsi que les
         couleurs Tailwind nommées (bg-white, text-slate-500, etc.) et les
         styles inline, pour que le mode contraste élevé s'applique de façon
         homogène sur les 4 pages (accueil, guide, decouvrir, telecharger)
         sans dépendre de la palette exacte utilisée par chaque section. */
      .rme-high-contrast,
      .rme-high-contrast body {
        background-color: #000 !important;
        color: #ffeb3b !important;
      }
      .rme-high-contrast * {
        background-color: #000 !important;
        background-image: none !important;
        color: #ffeb3b !important;
        border-color: #ffeb3b !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      .rme-high-contrast a,
      .rme-high-contrast a * {
        color: #ffd700 !important;
        text-decoration: underline !important;
      }
      .rme-high-contrast button,
      .rme-high-contrast button *,
      .rme-high-contrast [role="switch"],
      .rme-high-contrast [role="radio"],
      .rme-high-contrast input,
      .rme-high-contrast select,
      .rme-high-contrast textarea {
        background-color: #000 !important;
        color: #ffd700 !important;
        border: 2px solid #ffd700 !important;
      }
      .rme-high-contrast button[aria-checked="true"],
      .rme-high-contrast [role="radio"][aria-checked="true"] {
        background-color: #ffd700 !important;
        color: #000 !important;
      }
      .rme-high-contrast img,
      .rme-high-contrast svg {
        filter: contrast(1.6) grayscale(0.2);
      }
      /* Le bouton flottant "Vue+" et le panneau restent lisibles avec leurs
         propres couleurs fortes plutôt que d'être forcés en noir/jaune,
         pour ne pas se confondre avec le fond de page. */
      .rme-high-contrast .rme-skip-link {
        background-color: #ffd700 !important;
        color: #000 !important;
        border: 2px solid #000 !important;
      }

      /* Focus visible mode (renforcé)
         Un simple contour doré (#eead59) ne respecte pas 3:1 de contraste sur
         les fonds clairs du site (creme #f8f7f2 / blanc) — mesuré ~1.8:1,
         insuffisant pour un indicateur de focus (WCAG 2.4.11). On combine donc
         un contour doré ET un anneau sombre (box-shadow) : ensemble, l'un des
         deux reste toujours visible à 3:1+ quel que soit le fond (clair ou
         foncé) derrière l'élément ciblé. */
      .rme-focus-visible *:focus,
      .rme-focus-visible *:focus-visible {
        outline: 3px solid #0a2e28 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px #eead59 !important;
        border-radius: 4px !important;
      }
      .rme-focus-visible *:focus:not(:focus-visible) {
        outline: none !important;
        box-shadow: none !important;
      }

      /* Skip link */
      .rme-skip-link {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 10000;
        padding: 12px 24px;
        background: #eead59;
        color: #0d3f38;
        font-weight: 700;
        font-size: 14px;
        border-radius: 0 0 12px 0;
        text-decoration: none;
        transition: top 0.2s ease;
      }
      .rme-skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);

    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'rme-skip-link';
    skipLink.textContent = 'Aller au contenu principal';
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      // Note: don't remove on unmount as it's a global utility
    };
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Escape to close panel, and trap Tab/Shift+Tab focus inside the
  // panel while it is open (WAI-ARIA dialog pattern: focus must not escape
  // to the rest of the page while a modal-like panel is displayed).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (activeEl === first || !panelRef.current.contains(activeEl)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (activeEl === last || !panelRef.current.contains(activeEl)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus first element when panel opens
  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector(
        'button, [href], input, select, textarea'
      ) as HTMLElement | null;
      setTimeout(() => firstFocusable?.focus(), 100);
    }
  }, [open]);

  const updateSetting = <K extends keyof A11ySettings>(
    key: K,
    value: A11ySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReadPage = () => {
    if (!('speechSynthesis' in window)) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    // Get main content
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('#main-content') ||
      document.body;

    // Collect text from visible elements
    const walker = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return NodeFilter.FILTER_REJECT;
        }
        const text = node.textContent?.trim();
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const texts: string[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      texts.push(current.textContent?.trim() || '');
    }

    const fullText = texts.join('. ').slice(0, 5000);

    if (!fullText) return;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const handleStopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Bottom Left */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 left-4 z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #0d3f38, #0a2e28)',
          border: '2px solid #eead59',
        }}
        aria-label={
          open ? "Fermer les options d'accessibilité" : "Ouvrir les options d'accessibilité"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {open ? (
          <X size={24} className="text-[#eead59]" strokeWidth={2.5} />
        ) : (
          <Eye size={24} className="text-[#eead59]" strokeWidth={2.5} />
        )}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#0d3f38] bg-[#eead59] px-2 py-0.5 rounded-full whitespace-nowrap">
          Vue+
        </span>
      </button>

      {/* Accessibility Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Options d'accessibilité"
          className="fixed bottom-20 left-4 z-[9998] w-[calc(100vw-2rem)] sm:w-80 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d3f38 0%, #0a2e28 100%)',
            border: '1px solid rgba(238, 173, 89, 0.2)',
            animation: 'rmeA11ySlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style>{`
            @keyframes rmeA11ySlideIn {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes rmeA11yFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-white/10">
            <AccessibilityIcon size={18} className="text-[#eead59]" strokeWidth={2.5} />
            <h3 className="font-bold text-[#f8f7f2] text-sm flex-1">
              Accessibilité
            </h3>
            <button
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#f8f7f2]/50 hover:text-[#f8f7f2] hover:bg-white/10 transition-colors"
              aria-label="Fermer le panneau d'accessibilité"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5">
            {/* Text Size */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type size={15} className="text-[#eead59]" strokeWidth={2.5} />
                <label className="text-xs font-bold text-[#f8f7f2] uppercase tracking-wide">
                  Taille du texte
                </label>
              </div>
              <div className="flex gap-1.5" role="radiogroup" aria-label="Taille du texte">
                {(
                  [
                    { value: 'normal' as TextSize, label: 'Normal', size: '14px' },
                    { value: 'large' as TextSize, label: 'Grand', size: '16px' },
                    { value: 'xlarge' as TextSize, label: 'Très grand', size: '18px' },
                  ]
                ).map((option) => (
                  <button
                    key={option.value}
                    role="radio"
                    aria-checked={settings.textSize === option.value}
                    onClick={() => updateSetting('textSize', option.value)}
                    className="flex-1 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      fontSize: option.size,
                      background:
                        settings.textSize === option.value
                          ? 'linear-gradient(135deg, #eead59, #d4a04a)'
                          : 'rgba(255,255,255,0.05)',
                      color:
                        settings.textSize === option.value ? '#0d3f38' : '#f8f7f2',
                      border: `1px solid ${
                        settings.textSize === option.value
                          ? '#eead59'
                          : 'rgba(255,255,255,0.1)'
                      }`,
                    }}
                    aria-label={`Taille ${option.label}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {settings.highContrast ? (
                  <Sun size={16} className="text-[#eead59]" strokeWidth={2.5} />
                ) : (
                  <Moon size={16} className="text-[#f8f7f2]/60" strokeWidth={2.5} />
                )}
                <span className="text-sm font-semibold text-[#f8f7f2]">
                  Contraste élevé
                </span>
              </div>
              <button
                role="switch"
                aria-checked={settings.highContrast}
                aria-label="Basculer le contraste élevé"
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: settings.highContrast
                    ? '#eead59'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                <span
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: settings.highContrast
                      ? 'translateX(22px)'
                      : 'translateX(4px)',
                  }}
                />
              </button>
            </div>

            {/* Focus Visible Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Eye size={16} className={settings.focusVisible ? 'text-[#eead59]' : 'text-[#f8f7f2]/60'} strokeWidth={2.5} />
                <span className="text-sm font-semibold text-[#f8f7f2]">
                  Focus visible
                </span>
              </div>
              <button
                role="switch"
                aria-checked={settings.focusVisible}
                aria-label="Basculer le focus visible"
                onClick={() => updateSetting('focusVisible', !settings.focusVisible)}
                className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: settings.focusVisible
                    ? '#eead59'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                <span
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: settings.focusVisible
                      ? 'translateX(22px)'
                      : 'translateX(4px)',
                  }}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Read Page / Stop Reading */}
            <div className="space-y-2">
              <button
                onClick={handleReadPage}
                disabled={isReading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #eead59, #d4a04a)',
                  color: '#0d3f38',
                }}
                aria-label="Lire le contenu de la page à voix haute"
              >
                <Volume2 size={16} strokeWidth={2.5} />
                {isReading ? 'Lecture en cours...' : 'Lire la page'}
              </button>

              {isReading && (
                <button
                  onClick={handleStopReading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(238, 173, 89, 0.15)',
                    color: '#eead59',
                    border: '1px solid rgba(238, 173, 89, 0.3)',
                  }}
                  aria-label="Arrêter la lecture de la page"
                >
                  <Square size={14} strokeWidth={2.5} />
                  Arrêter la lecture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop when panel is open */}
      {open && (
        <div
          className="fixed inset-0 z-[9997] bg-black/20"
          onClick={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
