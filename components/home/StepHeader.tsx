/** En-tête commun des étapes du voyage sur l'accueil : numéro, titre, une phrase. */
export default function StepHeader({ step, title, text, id }: { step: number; title: string; text?: string; id?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0f1f3d] text-sm font-black text-[#f59e0b]">
        {step}
      </span>
      <div className="min-w-0">
        <h2 id={id} className="font-display text-2xl font-semibold leading-tight tracking-tight text-[#0f1f3d] sm:text-3xl">{title}</h2>
        {text && <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>}
      </div>
    </div>
  );
}
