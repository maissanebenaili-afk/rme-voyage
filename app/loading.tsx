import MoroccoFlag from '@/components/MoroccoFlag';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page..."
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 py-16 text-[#0f1f3d]"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-[#0f1f3d] animate-spin" />
        <span className="text-sm font-black text-[#0f1f3d]">R</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#475569]">
        <span>Chargement...</span>
        <MoroccoFlag className="inline-block h-3.5 w-5" />
      </div>
      <span className="sr-only">Chargement en cours</span>
    </div>
  );
}
