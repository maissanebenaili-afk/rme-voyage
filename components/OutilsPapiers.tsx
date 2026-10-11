"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Volume2 } from "lucide-react";
import { ETAPES, texteALire, type Outil } from "@/lib/outilsPapiers";

function useSpeech() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);
  function speak(text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
  return { supported, speak };
}

function OutilCard({ outil, speak, canSpeak }: { outil: Outil; speak: (t: string) => void; canSpeak: boolean }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-lg font-bold text-[#0f1f3d]">{outil.nom}</p>
      <p className="mt-1 text-base text-slate-700">{outil.phrase}</p>
      {outil.enLigne && (
        <p className="mt-2 text-sm font-semibold text-amber-800">
          Le fichier part sur internet : évitez-le pour un passeport ou une carte d&apos;identité.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={outil.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f1f3d] px-4 py-3 text-base font-bold text-white"
        >
          Ouvrir <ExternalLink size={18} />
        </a>
        {canSpeak && (
          <button
            type="button"
            onClick={() => speak(texteALire(outil))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-bold text-[#0f1f3d]"
            aria-label={`Écouter : ${outil.nom}`}
          >
            <Volume2 size={18} /> Écouter
          </button>
        )}
      </div>
    </li>
  );
}

export default function OutilsPapiers() {
  const { supported, speak } = useSpeech();
  return (
    <div className="space-y-8">
      {ETAPES.map((etape) => (
        <section key={etape.id} aria-labelledby={`etape-${etape.id}`}>
          <h2 id={`etape-${etape.id}`} className="flex items-center gap-3 text-xl font-black text-[#0f1f3d]">
            <span aria-hidden="true" className="text-3xl">{etape.emoji}</span>
            {etape.titre}
          </h2>
          <ul className="mt-3 space-y-3">
            {etape.outils.map((outil) => (
              <OutilCard key={outil.id} outil={outil} speak={speak} canSpeak={supported} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
