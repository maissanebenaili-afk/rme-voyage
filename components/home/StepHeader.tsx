'use client';

import { useHomeText } from '@/lib/LanguageContext';

/** En-tête commun des étapes du voyage sur l'accueil : pastille numérotée, un titre fort, une phrase. */
export default function StepHeader({ step, title, text, id }: { step?: number; title: string; text?: string; id?: string }) {
  const h = useHomeText();
  return (
    <div className="mb-5">
      {step !== undefined && (
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#b45309]">
          <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#0f1f3d] text-[13px] tracking-normal text-[#fcd34d] shadow-sm">{step}</span>
          <span>{h.step} {step}</span>
        </p>
      )}
      <h2 id={id} className="mt-2 font-display text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-[#0f1f3d] sm:text-4xl">{title}</h2>
      {text && <p className="mt-2 max-w-prose text-[15px] leading-6 text-slate-600">{text}</p>}
    </div>
  );
}
