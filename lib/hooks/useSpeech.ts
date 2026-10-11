import { useEffect, useState } from 'react';

/**
 * Lecture à voix haute avec la synthèse vocale du navigateur (gratuite, sans
 * serveur). `supported` reste faux pendant le rendu serveur et sur les
 * navigateurs sans l'API : l'interface masque alors le bouton « Écouter ».
 */
export function useSpeech(lang = 'fr-FR') {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported('speechSynthesis' in window);
  }, []);

  function speak(text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return { supported, speak };
}
