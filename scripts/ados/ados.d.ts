// Types des modules .mjs du feuilleton (utilisés par __tests__/filDor.test.ts).
declare module '*/scripts/ados/histoire.mjs' {
  export interface PersoEcran { id: string; x: number; emo: string }
  export interface Plan { bg: string; tint?: string; parle: string; ton: string; texte: string; persos: PersoEcran[] }
  export interface Episode { numero: number; titre: string; demain: string; plans: Plan[] }
  export const PERSOS: Record<string, { nom: string; voix: string; hauteur: number }>;
  export const EPISODES: Episode[];
  export function texteParle(plan: Plan): string;
}

declare module '*/scripts/ados/montage.mjs' {
  import type { Episode, Plan } from '*/scripts/ados/histoire.mjs';
  export type PlanMonte = Plan & { index: number; start: number; end: number; voixDebut: number; voixDuree: number };
  export interface Montage {
    numero: number; titre: string; demain: string; noms: Record<string, string>; fps: number;
    introFin: number; finDebut: number; total: number; shots: PlanMonte[];
  }
  export const INTRO: number;
  export const FIN: number;
  export function construire(ep: Episode, durees: number[], persos: Record<string, { nom: string }>, fps?: number): Montage;
}
