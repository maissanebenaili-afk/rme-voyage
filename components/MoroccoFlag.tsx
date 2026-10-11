/** Drapeau du Maroc en SVG : rendu identique partout (les emoji drapeaux ne s'affichent pas sous Windows). */
export default function MoroccoFlag({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" role="img" aria-label="Drapeau du Maroc" className={`${className} shrink-0 rounded-[3px] shadow-sm`}>
      <rect width="30" height="20" fill="#C1272D" />
      <polygon points="15,5 17.94,14.05 10.25,8.46 19.75,8.46 12.06,14.05" fill="none" stroke="#006233" strokeWidth="0.9" strokeLinejoin="miter" />
    </svg>
  );
}
