// Text-to-Speech utilities for SAFAR voice output

type Language = 'da' | 'fr' | 'en' | 'ar' | 'es';

interface VoiceOptions {
  lang: Language;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
}

const LANG_VOICES: Record<Language, string> = {
  da: 'ar-SA', // Arabic (Saudi Arabia) for Darija
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-SA',
  es: 'es-ES',
};

/**
 * Speak text using Web Speech API (client-side)
 * This function should only be called in browser context
 */
export function speak(
  text: string,
  options: VoiceOptions = { lang: 'en' }
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if browser supports Web Speech API
    const SpeechSynthesisUtterance =
      window.SpeechSynthesisUtterance || (window as any).webkitSpeechSynthesisUtterance;
    const speechSynthesis = window.speechSynthesis;

    if (!SpeechSynthesisUtterance || !speechSynthesis) {
      reject(new Error('Web Speech API not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language
    const voiceLang = LANG_VOICES[options.lang] || LANG_VOICES.en;
    utterance.lang = voiceLang;

    // Set speech properties
    if (options.rate) utterance.rate = Math.max(0.1, Math.min(10, options.rate));
    if (options.pitch) utterance.pitch = Math.max(0, Math.min(2, options.pitch));
    if (options.volume) utterance.volume = Math.max(0, Math.min(1, options.volume));

    // Set up event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(new Error(`Speech error: ${error.error}`));

    // Speak the text
    speechSynthesis.speak(utterance);
  });
}

/**
 * Stop speaking
 */
export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechSynthesisSupported(): boolean {
  return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Find voice for language
 */
export function findVoiceForLanguage(lang: Language): SpeechSynthesisVoice | undefined {
  if (!window.speechSynthesis) return undefined;

  const voices = window.speechSynthesis.getVoices();
  const targetLang = LANG_VOICES[lang];

  // First try exact match
  let voice = voices.find((v) => v.lang === targetLang);

  // If no exact match, try language prefix (e.g., en-US matches en)
  if (!voice) {
    const langPrefix = targetLang.split('-')[0];
    voice = voices.find((v) => v.lang.startsWith(langPrefix));
  }

  return voice;
}

/**
 * Text-to-speech with formatted output for assistant responses
 * Adds pauses and emphasis for better clarity
 */
export async function speakAssistantResponse(
  text: string,
  lang: Language = 'en'
): Promise<void> {
  try {
    // Add slight delays at sentence/punctuation boundaries for clarity
    const processedText = text
      .replace(/([.!?])([^ ])/g, '$1 $2') // Ensure space after punctuation
      .replace(/:/g, ': '); // Add space after colons

    await speak(processedText, {
      lang,
      rate: 0.9, // Slightly slower for clarity
      pitch: 1.0,
      volume: 0.9,
    });
  } catch {
    console.error('[speakAssistantResponse] Error');
    // Don't throw - voice output is optional
  }
}

/**
 * Interrupt and speak a new message
 * Useful for urgent alerts or corrections
 */
export async function interruptAndSpeak(
  text: string,
  lang: Language = 'en'
): Promise<void> {
  stopSpeaking();
  // Small delay to ensure previous speech is fully stopped
  await new Promise((resolve) => setTimeout(resolve, 100));
  return speak(text, { lang, rate: 1.2 }); // Slightly faster for urgency
}
