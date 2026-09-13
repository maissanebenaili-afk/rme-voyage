'use client';

import { useEffect, useState } from 'react';

type TextSize = 'normal' | 'large' | 'xlarge';
type RecognitionResultEvent = { results: { [index: number]: { [index: number]: { transcript: string } } } };
type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((event: RecognitionResultEvent) => void) | null; start: () => void };
type RecognitionConstructor = new () => Recognition;

function speakPage(locale: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const content = document.querySelector('main')?.innerText.replace(/\s+/g, ' ').trim();
  if (content) {
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = locale;
    window.speechSynthesis.speak(utterance);
  }
}

export default function AccessibilityTools() {
  const [size, setSize] = useState<TextSize>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [listening, setListening] = useState(false);
  const [locale, setLocale] = useState('fr-FR');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.documentElement.dataset.textSize = size;
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'normal';
  }, [size, highContrast]);

  function startListening() {
    const Recognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as RecognitionConstructor | undefined;
    if (!Recognition) {
      setMessage('La reconnaissance vocale n’est pas prise en charge par ce navigateur.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = locale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setMessage('Écoute en cours. Dites « planifier », « lire la page » ou « waqef ».'); };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setMessage('La commande vocale n’a pas été comprise. Réessayez.');
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      if (['planifier', 'itineraire', 'itinéraire', 'خطط', 'خطط الرحلة'].some((word) => text.includes(word))) {
        document.getElementById('planifier')?.scrollIntoView({ behavior: 'smooth' });
        setMessage(`Commande exécutée : ${text}.`);
      } else if (['lire', 'lire la page', 'قرا', 'اقرأ'].some((word) => text.includes(word))) {
        speakPage(locale);
        setMessage('Lecture de la page lancée.');
      } else if (['arreter', 'arrêter', 'stop', 'waqef', 'وقف'].some((word) => text.includes(word))) {
        window.speechSynthesis.cancel();
        setMessage('Lecture arrêtée.');
      } else setMessage(`Commande non reconnue : ${text}.`);
    };
    recognition.start();
  }

  return (
    <aside className="accessibility-tools" aria-label="Outils d’accessibilité">
      <p className="accessibility-tools__title">Accessibilité</p>
      <div className="accessibility-tools__buttons">
        <button type="button" onClick={() => setSize('normal')} aria-pressed={size === 'normal'}>A</button>
        <button type="button" onClick={() => setSize('large')} aria-pressed={size === 'large'}>A+</button>
        <button type="button" onClick={() => setSize('xlarge')} aria-pressed={size === 'xlarge'}>A++</button>
        <button type="button" onClick={() => setHighContrast((value) => !value)} aria-pressed={highContrast}>Contraste</button>
        <button type="button" onClick={() => speakPage(locale)}>Lire la page</button>
        <label className="sr-only" htmlFor="voice-language">Langue de commande vocale</label>
        <select id="voice-language" value={locale} onChange={(event) => setLocale(event.target.value)} aria-label="Langue de commande vocale">
          <option value="fr-FR">Français</option><option value="ar-MA">Darija</option><option value="en-US">English</option><option value="es-ES">Español</option>
        </select>
        <button type="button" onClick={startListening} aria-pressed={listening}>{listening ? 'Écoute…' : 'Commande vocale'}</button>
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
    </aside>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}
