/** En-tête commun des étapes du voyage sur l'accueil : « Étape n », un titre fort, une phrase. */
export default function StepHeader({ step, title, text, id }: { step?: number; title: string; text?: string; id?: string }) {
  return (
    <div className="mb-5">
      {step !== undefined && (
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#b45309]">Étape {step}</p>
      )}
      <h2 id={id} className="mt-1 font-display text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-[#0f1f3d] sm:text-4xl">{title}</h2>
      {text && <p className="mt-2 max-w-prose text-[15px] leading-6 text-slate-600">{text}</p>}
    </div>
  );
}
