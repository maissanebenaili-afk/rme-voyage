'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'rme-pwa-install-dismissed';

export default function PWAInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      // Show iOS banner after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Show banner after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      // Store timer for cleanup
      (handler as unknown as { _timer?: ReturnType<typeof setTimeout> })._timer = timer;
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      const t = (handler as unknown as { _timer?: ReturnType<typeof setTimeout> })._timer;
      if (t) clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted' || choice.outcome === 'dismissed') {
        setInstallEvent(null);
        setShowBanner(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  // Don't render if already dismissed or already installed
  if (!showBanner) return null;
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  ) {
    return null;
  }

  return (
    <>
      {/* Main Install Banner */}
      {showBanner && !showIOSInstructions && (
        <div
          className="fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:max-w-sm"
          style={{ animation: 'rmeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <style>{`
            @keyframes rmeSlideUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes rmeFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div className="flex items-start gap-3 rounded-2xl p-4 shadow-2xl border border-[#eead59]/30"
            style={{
              background: 'linear-gradient(135deg, #0d3f38 0%, #0a2e28 100%)',
            }}
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #eead59, #d4a04a)' }}
            >
              <Download size={22} className="text-[#0d3f38]" strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#f8f7f2] text-base leading-tight">
                Installer l'application
              </h3>
              <p className="text-xs text-[#f8f7f2]/70 mt-0.5 leading-relaxed">
                Accédez à RME Voyage hors ligne, plus rapide qu'un navigateur.
              </p>

              {/* Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={isIOS ? () => setShowIOSInstructions(true) : handleInstall}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #eead59, #d4a04a)',
                    color: '#0d3f38',
                  }}
                  aria-label="Installer l'application RME Voyage"
                >
                  <Download size={15} strokeWidth={2.5} />
                  Installer
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-lg font-medium text-sm text-[#f8f7f2]/60 hover:text-[#f8f7f2] hover:bg-white/5 transition-colors"
                  aria-label="Fermer la bannière d'installation"
                >
                  Plus tard
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#f8f7f2]/40 hover:text-[#f8f7f2] hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
          style={{ animation: 'rmeFadeIn 0.3s ease forwards' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0d3f38 0%, #0a2e28 100%)',
              animation: 'rmeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-bold text-[#f8f7f2] text-lg">
                Installer sur iPhone
              </h3>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#f8f7f2]/50 hover:text-[#f8f7f2] hover:bg-white/10 transition-colors"
                aria-label="Fermer les instructions"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(238, 173, 89, 0.15)' }}
                >
                  <Share size={16} className="text-[#eead59]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f8f7f2]">
                    1. Appuyez sur le bouton Partager
                  </p>
                  <p className="text-xs text-[#f8f7f2]/60 mt-0.5">
                    L'icône carrée avec la flèche vers le haut, en bas de l'écran.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(238, 173, 89, 0.15)' }}
                >
                  <Plus size={16} className="text-[#eead59]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f8f7f2]">
                    2. Sélectionnez « Sur l'écran d'accueil »
                  </p>
                  <p className="text-xs text-[#f8f7f2]/60 mt-0.5">
                    Faites défiler et choisissez cette option.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(238, 173, 89, 0.15)' }}
                >
                  <Download size={16} className="text-[#eead59]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f8f7f2]">
                    3. Appuyez sur « Ajouter »
                  </p>
                  <p className="text-xs text-[#f8f7f2]/60 mt-0.5">
                    L'application apparaît sur votre écran d'accueil.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0">
              <button
                onClick={handleDismiss}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #eead59, #d4a04a)',
                  color: '#0d3f38',
                }}
                aria-label="J'ai compris, fermer"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
