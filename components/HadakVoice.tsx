'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Square,
  Loader2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Lang = 'da' | 'fr' | 'en' | 'ar' | 'es';

interface HadakVoiceProps {
  /** The URL of the deployed HadakAI chat page (route to open in a new tab). */
  hadakUrl?: string;
  /** Optional callback that receives the final transcript so the parent can feed it to HadakAI. */
  onTranscript?: (text: string, lang: Lang) => void;
  /** Optional: receive the last Hadak response text to auto-read. Parent calls this when Hadak answers. */
  lastAssistantMessage?: string;
  /** Current language of the conversation. */
  lang?: Lang;
}

/* ------------------------------------------------------------------ */
/*  Language mapping for speech APIs                                   */
/*  Darija has no official code, so we use ar-MA (Moroccan Arabic).   */
/* ------------------------------------------------------------------ */

const SPEECH_LANG: Record<Lang, string> = {
  da: 'ar-MA',
  ar: 'ar-MA',
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
};

const VOICE_LABELS: Record<Lang, { speak: string; listening: string; notSupported: string }> = {
  da: { speak: 'Parler à Hadak', listening: 'Kansm3ek...', notSupported: 'L-vision m3a l-kalima machi momkin f had navigateur' },
  fr: { speak: 'Parler à Hadak', listening: 'Je vous écoute...', notSupported: 'La reconnaissance vocale n\'est pas disponible sur ce navigateur' },
  en: { speak: 'Speak to Hadak', listening: 'Listening...', notSupported: 'Speech recognition is not available in this browser' },
  ar: { speak: 'تحدث إلى حدّاك', listening: 'أستمع إليك...', notSupported: 'التعرف على الصوت غير متاح في هذا المتصفح' },
  es: { speak: 'Hablar con Hadak', listening: 'Escuchando...', notSupported: 'El reconocimiento de voz no está disponible en este navegador' },
};

/* ------------------------------------------------------------------ */
/*  Simple QR-like SVG pattern (deterministic, decorative)            */
/*  Real QR codes are complex; this gives a jury-friendly visual.      */
/* ------------------------------------------------------------------ */

function VoiceWaveform({ active }: { active: boolean }) {
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="flex h-6 items-center justify-center gap-1" aria-hidden>
      {bars.map((i) => (
        <span
          key={i}
          className="w-1 rounded-full"
          style={{
            background: '#eead59',
            animation: active
              ? `hadak-wave-${i} 0.9s ease-in-out infinite`
              : 'none',
            height: active ? undefined : '6px',
          }}
        />
      ))}
      <style jsx>{`
        ${bars
          .map(
            (i) => `
          @keyframes hadak-wave-${i} {
            0%, 100% { height: 6px; opacity: 0.5; }
            50% { height: ${10 + i * 3}px; opacity: 1; }
          }
        `
          )
          .join('\n')}
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HadakVoice({
  hadakUrl,
  onTranscript,
  lastAssistantMessage,
  lang = 'da',
}: HadakVoiceProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoRead, setAutoRead] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastReadRef = useRef<string>('');

  const labels = VOICE_LABELS[lang];

  /* ----------------- Initialize Speech APIs ----------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Speech Recognition (webkit prefix for Chrome/Edge/Safari)
    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionImpl) {
      const rec = new SpeechRecognitionImpl();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = SPEECH_LANG[lang];

      rec.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        if (finalText) {
          setTranscript((prev) => (prev + ' ' + finalText).trim());
          setInterim('');
        } else {
          setInterim(interimText);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setError(lang === 'fr' ? 'Aucune parole détectée' : lang === 'ar' ? 'لم يتم اكتشاف كلام' : 'No speech detected');
        } else if (event.error === 'not-allowed') {
          setError(lang === 'fr' ? 'Microphone bloqué. Autorisez-le dans les réglages.' : 'Microphone blocked. Allow access in settings.');
        } else {
          setError(event.error);
        }
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
        setInterim('');
      };

      recognitionRef.current = rec;
    }

    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [lang]);

  /* ----------------- Auto-read Hadak's responses ----------------- */
  useEffect(() => {
    if (!autoRead || !synthRef.current || !lastAssistantMessage) return;
    if (lastReadRef.current === lastAssistantMessage) return;
    lastReadRef.current = lastAssistantMessage;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(lastAssistantMessage);
    utterance.lang = SPEECH_LANG[lang];
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to pick a voice matching the language
    const voices = synthRef.current.getVoices();
    const match = voices.find((v) => v.lang.startsWith(SPEECH_LANG[lang].slice(0, 2)));
    if (match) utterance.voice = match;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.speak(utterance);
  }, [lastAssistantMessage, autoRead, lang]);

  /* ----------------- Speech recognition controls ----------------- */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError(labels.notSupported);
      return;
    }
    setError(null);
    setTranscript('');
    setInterim('');
    try {
      recognitionRef.current.lang = SPEECH_LANG[lang];
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // Already started
    }
  }, [lang, labels.notSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
    setInterim('');

    // Send transcript to parent
    if (transcript && onTranscript) {
      onTranscript(transcript, lang);
    }
  }, [transcript, onTranscript, lang]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  /* ----------------- Stop speaking ----------------- */
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  /* ----------------- Manual read aloud ----------------- */
  const readAloud = useCallback(
    (text: string) => {
      if (!synthRef.current || !text) return;
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = SPEECH_LANG[lang];
      u.rate = 0.95;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synthRef.current.speak(u);
    },
    [lang]
  );

  const speechSupported = !!recognitionRef.current;
  const synthSupported = !!synthRef.current;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <>
      {/* Floating voice button — sits next to HadakAI's button */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={labels.speak}
        title={labels.speak}
        className="fixed bottom-24 right-4 z-[9998] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 sm:right-6"
        style={{
          background: 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
          boxShadow: '0 6px 20px rgba(238, 173, 89, 0.4)',
          animation: listening ? 'hadak-pulse 1.5s ease-in-out infinite' : undefined,
        }}
      >
        {listening ? (
          <MicOff className="h-6 w-6 text-[#0d3f38]" />
        ) : (
          <Mic className="h-6 w-6 text-[#0d3f38]" />
        )}
      </button>

      {/* Voice panel */}
      {panelOpen && (
        <div
          className="fixed bottom-40 right-4 z-[9999] w-[min(92vw,360px)] overflow-hidden rounded-3xl shadow-2xl sm:right-6"
          style={{
            background: 'linear-gradient(160deg, #0d3f38 0%, #0a2e29 100%)',
            border: '1px solid rgba(238, 173, 89, 0.2)',
            animation: 'hadak-voice-in 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eead59]/15 px-5 py-4">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#eead59]" />
              <span className="text-sm font-bold text-white">
                {lang === 'da' ? 'Hadak Voice' : lang === 'fr' ? 'Hadak Voix' : lang === 'ar' ? 'حدّاك صوتي' : 'Hadak Voice'}
              </span>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-white/50 transition hover:text-white"
              aria-label="Close"
            >
              <Square className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Status / waveform */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 px-4 py-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full transition-all"
                style={{
                  background: listening
                    ? 'rgba(238, 173, 89, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: listening ? '2px solid #eead59' : '2px solid rgba(255,255,255,0.1)',
                }}
              >
                {listening ? (
                  <VoiceWaveform active />
                ) : speaking ? (
                  <Volume2 className="h-7 w-7 text-[#eead59]" />
                ) : (
                  <Mic className="h-7 w-7 text-white/60" />
                )}
              </div>
              <p className="text-center text-xs font-medium text-white/70">
                {listening
                  ? labels.listening
                  : speaking
                  ? lang === 'da' ? 'Hadak kayhdar...' : lang === 'fr' ? 'Hadak parle...' : lang === 'ar' ? 'حدّاك يتحدث...' : 'Hadak is speaking...'
                  : labels.speak}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Transcript display */}
            {(transcript || interim) && (
              <div className="rounded-xl bg-white/5 px-3 py-2.5">
                <p className="text-xs text-white/40 mb-1">
                  {lang === 'da' ? 'Text dyalek:' : lang === 'fr' ? 'Votre texte :' : lang === 'ar' ? 'نصك:' : 'Your text:'}
                </p>
                <p className="text-sm text-white/90">
                  {transcript}
                  {interim && <span className="text-white/50"> {interim}</span>}
                </p>
              </div>
            )}

            {/* Main mic button */}
            {speechSupported ? (
              <button
                onClick={toggleListening}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all active:scale-95"
                style={{
                  background: listening
                    ? 'linear-gradient(135deg, #e8553d 0%, #c43e28 100%)'
                    : 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
                  color: '#0d3f38',
                  boxShadow: listening
                    ? '0 4px 14px rgba(232, 85, 61, 0.3)'
                    : '0 4px 14px rgba(238, 173, 89, 0.3)',
                }}
              >
                {listening ? (
                  <>
                    <Square className="h-4 w-4" />
                    {lang === 'da' ? 'Wqef' : lang === 'fr' ? 'Arrêter' : lang === 'ar' ? 'إيقاف' : 'Stop'}
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    {labels.speak}
                  </>
                )}
              </button>
            ) : (
              <div className="rounded-xl bg-white/5 px-3 py-3 text-center text-xs text-white/50">
                {labels.notSupported}
              </div>
            )}

            {/* Send to Hadak (if transcript exists and callback provided) */}
            {transcript && onTranscript && !listening && (
              <button
                onClick={() => {
                  onTranscript(transcript, lang);
                  setTranscript('');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
              >
                {lang === 'da' ? 'Sift l-Hadak' : lang === 'fr' ? 'Envoyer à Hadak' : lang === 'ar' ? 'أرسل إلى حدّاك' : 'Send to Hadak'}
              </button>
            )}

            {/* Controls row */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              {/* Auto-read toggle */}
              <button
                onClick={() => setAutoRead((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium transition"
                style={{ color: autoRead ? '#eead59' : 'rgba(255,255,255,0.4)' }}
                aria-label="Toggle auto-read"
              >
                {autoRead ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {lang === 'da' ? 'Lecture auto' : lang === 'fr' ? 'Lecture auto' : lang === 'ar' ? 'قراءة تلقائية' : 'Auto-read'}
              </button>

              {/* Stop speaking */}
              {speaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/60 transition hover:text-white"
                >
                  <Square className="h-3 w-3" />
                  {lang === 'da' ? 'Wqef l-hadra' : lang === 'fr' ? 'Stop lecture' : 'Stop'}
                </button>
              )}
            </div>

            {/* Fallback: text input + read button */}
            {!speechSupported && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={lang === 'da' ? 'Ktub hna w hadak ghadi yqra...' : lang === 'fr' ? 'Écrivez ici et Hadak lira...' : 'Type here and Hadak will read it...'}
                  className="w-full resize-none rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#eead59]/50"
                  rows={2}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
                <button
                  onClick={() => readAloud(transcript)}
                  disabled={!transcript || !synthSupported}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#eead59] px-4 py-2 text-xs font-bold text-[#0d3f38] transition hover:bg-[#f5cd93] disabled:opacity-30"
                >
                  <Volume2 className="h-4 w-4" />
                  {lang === 'da' ? 'Qra b-sout' : lang === 'fr' ? 'Lire à voix haute' : 'Read aloud'}
                </button>
              </div>
            )}

            {/* Link to full Hadak chat */}
            {hadakUrl && (
              <a
                href={hadakUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs font-medium text-[#eead59]/70 transition hover:text-[#eead59]"
              >
                {lang === 'da' ? 'Ftah Hadak chat kamel →' : lang === 'fr' ? 'Ouvrir le chat complet →' : 'Open full chat →'}
              </a>
            )}
          </div>

          {/* Animations */}
          <style jsx>{`
            @keyframes hadak-pulse {
              0%, 100% {
                box-shadow: 0 6px 20px rgba(238, 173, 89, 0.4),
                            0 0 0 0 rgba(238, 173, 89, 0.5);
              }
              50% {
                box-shadow: 0 6px 20px rgba(238, 173, 89, 0.4),
                            0 0 0 12px rgba(238, 173, 89, 0);
              }
            }
            @keyframes hadak-voice-in {
              from {
                opacity: 0;
                transform: translateY(16px) scale(0.96);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
