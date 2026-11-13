'use client';

import { useEffect, useState } from 'react';
import { Download, CheckCircle2, Smartphone, Apple } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isInstalled);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  if (isStandalone) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-5 py-3 text-sm font-extrabold text-emerald-300 ring-1 ring-emerald-400/30">
        <CheckCircle2 size={18} />
        Application déjà installée sur cet appareil
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-6 text-base font-extrabold text-[#0f1f3d] shadow-lg transition hover:bg-[#fcd34d] active:scale-95"
      >
        <Download size={20} />
        Installer l&apos;application maintenant
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm text-white/80">
      {isIOS ? <Apple size={18} className="text-[#f5cd93]" /> : <Smartphone size={18} className="text-[#f5cd93]" />}
      <span>Suivez les étapes ci-dessous selon votre appareil</span>
    </div>
  );
}
