'use client';

import { useEffect, useRef, useState } from 'react';
import { LARGEUR_MONDE, SKATEUR, avancer, nouvelleCourse, points, sauter, type Course } from '@/lib/jeux/skate';
import { battre, charger, enregistrer } from '@/lib/jeux/records';

const HAUTEUR_MONDE = 200;
const SOL = 172; // ordonnée du sol à l'écran

// Notre skateur : un enfant en casquette sur sa planche, en formes simples.
function dessinerSkateur(ctx: CanvasRenderingContext2D, y: number, t: number) {
  const x = SKATEUR.x;
  const base = SOL - y;
  const penche = y > 0 ? -0.15 : Math.sin(t / 160) * 0.04;
  ctx.save();
  ctx.translate(x + 17, base);
  ctx.rotate(penche);
  // planche et roues
  ctx.fillStyle = '#e4572e';
  ctx.fillRect(-20, -8, 40, 5);
  ctx.fillStyle = '#26313f';
  ctx.beginPath();
  ctx.arc(-13, -2, 3, 0, Math.PI * 2);
  ctx.arc(13, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  // jambes
  ctx.fillStyle = '#2747c9';
  ctx.fillRect(-9, -24, 6, 16);
  ctx.fillRect(3, -24, 6, 16);
  // tee-shirt et bras écartés pour l'équilibre
  ctx.fillStyle = '#0f7a5c';
  ctx.fillRect(-10, -40, 20, 17);
  ctx.fillRect(-18, -38, 8, 4);
  ctx.fillRect(10, -38, 8, 4);
  // tête et casquette
  ctx.fillStyle = '#a8673d';
  ctx.beginPath();
  ctx.arc(0, -47, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d99a1e';
  ctx.fillRect(-7, -55, 14, 5);
  ctx.fillRect(4, -52, 8, 2);
  ctx.restore();
}

function dessinerPlot(ctx: CanvasRenderingContext2D, x: number, largeur: number, hauteur: number) {
  ctx.fillStyle = '#f26b1d';
  ctx.beginPath();
  ctx.moveTo(x + largeur / 2, SOL - hauteur);
  ctx.lineTo(x + largeur, SOL - 3);
  ctx.lineTo(x, SOL - 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + largeur * 0.28, SOL - hauteur * 0.55, largeur * 0.44, 4);
  ctx.fillStyle = '#26313f';
  ctx.fillRect(x - 3, SOL - 3, largeur + 6, 3);
}

function dessinerPiece(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#f5b13d';
  ctx.beginPath();
  ctx.arc(x, SOL - y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.fillRect(x - 1, SOL - y - 4, 2, 8);
}

function dessiner(ctx: CanvasRenderingContext2D, course: Course, t: number) {
  // ciel, mer et ville au loin (défilement lent)
  ctx.fillStyle = '#bfe3f5';
  ctx.fillRect(0, 0, LARGEUR_MONDE, HAUTEUR_MONDE);
  ctx.fillStyle = '#3d8fc4';
  ctx.fillRect(0, 118, LARGEUR_MONDE, 30);
  const decalage = (course.distance * 0.15) % 120;
  ctx.fillStyle = '#ffffff';
  for (let i = -1; i < 7; i++) {
    const bx = i * 120 - decalage;
    ctx.fillRect(bx, 92, 46, 28);
    ctx.fillRect(bx + 54, 84, 34, 36);
  }
  ctx.fillStyle = '#c9c2b4';
  ctx.fillRect(0, 148, LARGEUR_MONDE, SOL - 148);
  ctx.fillStyle = '#8f8a80';
  ctx.fillRect(0, SOL, LARGEUR_MONDE, HAUTEUR_MONDE - SOL);
  for (const p of course.pieces) dessinerPiece(ctx, p.x, p.y);
  for (const o of course.obstacles) dessinerPlot(ctx, o.x, o.largeur, o.hauteur);
  dessinerSkateur(ctx, course.y, t);
  ctx.fillStyle = '#0f1f3d';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${points(course)}`, LARGEUR_MONDE - 14, 26);
  ctx.textAlign = 'left';
  ctx.fillText(`🪙 ${course.ramassees}`, 14, 26);
}

export default function Skate() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const courseRef = useRef<Course>(nouvelleCourse());
  const [etat, setEtat] = useState<'attente' | 'course' | 'fini'>('attente');
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [nouveauRecord, setNouveauRecord] = useState(false);

  useEffect(() => {
    setRecord(charger().skate ?? 0);
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
        const { records, nouveau } = battre(charger(), 'skate', s);
        if (nouveau) enregistrer(records);
        setScore(s);
        setRecord(records.skate ?? s);
        setNouveauRecord(nouveau);
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
    setNouveauRecord(false);
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
          <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
            <span className="text-2xl font-black">
              {etat === 'fini' ? (nouveauRecord ? `Nouveau record : ${score} !` : `${score} points`) : 'Touchez pour rouler'}
            </span>
            <span className="mt-1 text-base">{etat === 'fini' ? 'Touchez pour rejouer' : 'Touchez pour sauter, ramassez les pièces'}</span>
          </span>
        )}
      </button>
      <p className="mt-2 text-center text-sm font-semibold text-slate-700">Record : {record}</p>
    </div>
  );
}
