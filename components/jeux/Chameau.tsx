'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAMEAU, LARGEUR_MONDE, avancer, nouvelleCourse, points, sauter, type Course } from '@/lib/jeux/chameau';

const HAUTEUR_MONDE = 200;
const SOL = 170; // ordonnée du sol à l'écran

// Notre chameau, dessiné avec des formes simples.
function dessinerChameau(ctx: CanvasRenderingContext2D, y: number, t: number) {
  const x = CHAMEAU.x;
  const base = SOL - y;
  ctx.fillStyle = '#b5773a';
  // pattes (elles bougent en courant)
  const pas = y > 0 ? 0 : Math.sin(t / 60) * 4;
  ctx.fillRect(x + 8 + pas, base - 14, 5, 14);
  ctx.fillRect(x + 30 - pas, base - 14, 5, 14);
  // corps et bosse
  ctx.beginPath();
  ctx.ellipse(x + 22, base - 22, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 20, base - 32, 9, 8, 0, Math.PI, 0);
  ctx.fill();
  // cou et tête
  ctx.fillRect(x + 36, base - 40, 6, 18);
  ctx.beginPath();
  ctx.ellipse(x + 44, base - 41, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(x + 45, base - 43, 2, 2);
}

function dessinerCactus(ctx: CanvasRenderingContext2D, x: number, largeur: number, hauteur: number) {
  ctx.fillStyle = '#2f8a4b';
  const tronc = Math.max(8, largeur * 0.45);
  const cx = x + (largeur - tronc) / 2;
  ctx.fillRect(cx, SOL - hauteur, tronc, hauteur);
  ctx.fillRect(x, SOL - hauteur * 0.6, (largeur - tronc) / 2, 5);
  ctx.fillRect(x, SOL - hauteur * 0.75, 4, hauteur * 0.2);
  ctx.fillRect(cx + tronc, SOL - hauteur * 0.5, (largeur - tronc) / 2, 5);
  ctx.fillRect(x + largeur - 4, SOL - hauteur * 0.65, 4, hauteur * 0.2);
}

function dessiner(ctx: CanvasRenderingContext2D, course: Course, t: number) {
  ctx.clearRect(0, 0, LARGEUR_MONDE, HAUTEUR_MONDE);
  ctx.fillStyle = '#fde9c4';
  ctx.fillRect(0, 0, LARGEUR_MONDE, HAUTEUR_MONDE);
  ctx.fillStyle = '#f5b13d';
  ctx.beginPath();
  ctx.arc(520, 40, 20, 0, Math.PI * 2);
  ctx.fill();
  // dunes
  ctx.fillStyle = '#efcf93';
  ctx.beginPath();
  ctx.ellipse(150 - ((course.distance * 0.2) % 700), SOL + 10, 220, 50, 0, Math.PI, 0);
  ctx.ellipse(500 - ((course.distance * 0.2) % 700) + 700, SOL + 10, 260, 60, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#d9a75e';
  ctx.fillRect(0, SOL, LARGEUR_MONDE, HAUTEUR_MONDE - SOL);
  for (const c of course.cactus) dessinerCactus(ctx, c.x, c.largeur, c.hauteur);
  dessinerChameau(ctx, course.y, t);
  ctx.fillStyle = '#0f1f3d';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(String(points(course)), LARGEUR_MONDE - 14, 26);
}

export default function Chameau() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const courseRef = useRef<Course>(nouvelleCourse());
  const [etat, setEtat] = useState<'attente' | 'course' | 'fini'>('attente');
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) dessiner(ctx, courseRef.current, 0);
  }, []);

  useEffect(() => {
    if (etat !== 'course') return;
    let precedent = performance.now();
    let frame = 0;
    const boucle = (maintenant: number) => {
      courseRef.current = avancer(courseRef.current, (maintenant - precedent) / 1000);
      precedent = maintenant;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) dessiner(ctx, courseRef.current, maintenant);
      if (courseRef.current.fini) {
        const s = points(courseRef.current);
        setScore(s);
        setRecord((r) => Math.max(r, s));
        setEtat('fini');
        return;
      }
      frame = requestAnimationFrame(boucle);
    };
    frame = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(frame);
  }, [etat]);

  function appui() {
    if (etat === 'course') {
      courseRef.current = sauter(courseRef.current);
      return;
    }
    courseRef.current = sauter(nouvelleCourse());
    setEtat('course');
  }

  useEffect(() => {
    function touche(e: KeyboardEvent) {
      if (e.key !== ' ' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      appui();
    }
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  });

  return (
    <div>
      <button
        type="button"
        onClick={appui}
        aria-label={etat === 'course' ? 'Sauter' : 'Commencer la course'}
        className="relative block w-full overflow-hidden rounded-2xl"
      >
        <canvas ref={canvasRef} width={LARGEUR_MONDE} height={HAUTEUR_MONDE} className="block h-auto w-full" />
        {etat !== 'course' && (
          <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white">
            <span className="text-2xl font-black">{etat === 'fini' ? `${score} points` : 'Touchez pour courir'}</span>
            <span className="mt-1 text-base">{etat === 'fini' ? 'Touchez pour rejouer' : 'Touchez encore pour sauter'}</span>
          </span>
        )}
      </button>
      <p className="mt-2 text-center text-sm font-semibold text-slate-700">Record : {record}</p>
    </div>
  );
}
