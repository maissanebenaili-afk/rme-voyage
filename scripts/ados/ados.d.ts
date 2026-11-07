// Types des modules .mjs du feuilleton (utilisés par __tests__/filDor.test.ts).
declare module '*/scripts/ados/histoire.mjs' {
  export interface PersoEcran { id: string; x: number; emo: string; emo2?: string; act?: string }
  export interface Plan { bg: string; tint?: string; parle?: string; ton?: string; texte?: string; persos: PersoEcran[]; insert?: string; duree?: number; cam?: string; fx?: string[]; intensite?: number }
  export interface Episode { numero: number; titre: string; demain: string; question: string; plans: Plan[] }
  export const PERSOS: Record<string, { nom: string; voix: string; hauteur: number }>;
  export const EPISODES: Episode[];
  export function texteParle(plan: Plan): string;
  export function avecVoix(plan: Plan): boolean;
}

declare module '*/scripts/ados/montage.mjs' {
  import type { Episode, Plan } from '*/scripts/ados/histoire.mjs';
  export type PlanMonte = Plan & { index: number; start: number; end: number; voixDebut: number; voixDuree: number; voixIndex: number };
  export interface Montage {
    numero: number; titre: string; demain: string; question: string; noms: Record<string, string>; fps: number;
    introFin: number; finDebut: number; total: number; shots: PlanMonte[];
  }
  export const INTRO: number;
  export const FIN: number;
  export function construire(ep: Episode, durees: number[], persos: Record<string, { nom: string }>, fps?: number): Montage;
  export function plansParlants(S: Montage): PlanMonte[];
  export function decouper(S: Montage, cible?: number): { debut: number; fin: number }[];
}

declare module '*/scripts/ados/histoire-foot.mjs' {
  export interface PersoEcran { id: string; x: number; emo: string; emo2?: string; act?: string }
  export interface Plan { bg: string; tint?: string; parle?: string; ton?: string; texte?: string; persos: PersoEcran[]; insert?: string; duree?: number; cam?: string; fx?: string[]; intensite?: number }
  export interface Episode { numero: number; titre: string; demain: string; question: string; plans: Plan[] }
  export const SERIE: { titre: string; etiquette: string; dossier: string; musique: string };
  export const PERSOS: Record<string, { nom: string; voix: string; hauteur: number }>;
  export const EPISODES: Episode[];
  export function avecVoix(plan: Plan): boolean;
}
