import { BISON_DEPARTURES_2026 } from '../lib/lab/crossingWindow/data2026';
import { assessDeparture, frenchLevel, portLevel, rankWindow, travelHours, type Trip } from '../lib/lab/crossingWindow/engine';
import { tripFromRoutePage } from '../lib/lab/crossingWindow/trips';

const paris = tripFromRoutePage('paris-tanger')!;

describe('« Quand partir ? » — données', () => {
  test('62 jours de juillet-août 2026, niveaux valides', () => {
    const days = Object.keys(BISON_DEPARTURES_2026);
    expect(days).toHaveLength(62);
    expect(days[0]).toBe('2026-07-01');
    expect(days[61]).toBe('2026-08-31');
    for (const b of Object.values(BISON_DEPARTURES_2026)) {
      expect([0, 1, 2, 3]).toContain(b.national);
      if (b.zones) expect(b.zones.level).toBeGreaterThan(b.national);
    }
  });

  test('repères du calendrier officiel : samedi 1er août noir, vendredi 31 juillet noir dans le Sud-Ouest', () => {
    expect(BISON_DEPARTURES_2026['2026-08-01'].national).toBe(3);
    expect(frenchLevel('2026-07-31', [1, 5]).level).toBe(3);
    expect(frenchLevel('2026-07-31', [4, 6]).level).toBe(2);
  });

  test('le trajet Paris → Tanger vient des pages /trajet (environ 20 h de conduite, 41 % en France, port de Tarifa)', () => {
    expect(paris.origin).toBe('Paris');
    expect(paris.port).toBe('Tarifa');
    expect(paris.drivingSeconds / 3600).toBeGreaterThan(19);
    expect(paris.franceShare).toBeGreaterThan(0.35);
    expect(paris.franceShare).toBeLessThan(0.45);
  });
});

describe('« Quand partir ? » — moteur', () => {
  test('le pire cas documenté : départ de Paris vendredi 31 juillet au soir, arrivée au port le samedi du record', () => {
    const a = assessDeparture(paris, '2026-07-31', 18, 'relais');
    expect(a.arrivalAtPort).toBe('2026-08-01');
    expect(a.combined).toBe(3);
    expect(a.reasons.some((r) => r.text.includes('1 929') && r.status === 'À VÉRIFIER')).toBe(true);
  });

  test('le piège transfrontalier : jeudi « vert » en France, arrivée au port un jour chargé', () => {
    // Départ à 6 h : toute la partie française se fait le jeudi (vert), l'arrivée au port tombe le vendredi 31.
    const a = assessDeparture(paris, '2026-07-30', 6, 'relais');
    expect(a.frenchDays).toEqual(['2026-07-30']);
    expect(a.arrivalAtPort).toBe('2026-07-31');
    expect(a.roadLevel).toBe(0);
    expect(a.portLevel).toBeGreaterThanOrEqual(2);
    expect(a.crossBorderTrap).toBe(true);
  });

  test('le même jeudi à 18 h n’est pas un piège : la nuit déborde sur le vendredi rouge en France', () => {
    const a = assessDeparture(paris, '2026-07-30', 18, 'relais');
    expect(a.frenchDays).toEqual(['2026-07-30', '2026-07-31']);
    expect(a.roadLevel).toBe(3);
    expect(a.crossBorderTrap).toBe(false);
  });

  test('un mardi début août est plus calme que le premier week-end, aux deux bouts', () => {
    const tue = assessDeparture(paris, '2026-08-04', 6, 'relais');
    expect(tue.roadLevel).toBe(0);
    expect(tue.portLevel).toBe(1);
    expect(tue.crossBorderTrap).toBe(false);
  });

  test('le classement met les jours calmes devant et les jours inconnus derrière, jamais devant', () => {
    const ranked = rankWindow(paris, '2026-08-25', '2026-09-05', 8, 'relais');
    const unknown = ranked.filter((a) => a.combined === null);
    expect(unknown.length).toBeGreaterThan(0); // septembre : pas de données Bison Futé chargées
    expect(ranked[ranked.length - 1].combined).toBeNull();
    expect(ranked[0].combined).not.toBeNull();
    expect(unknown.every((a) => a.label === 'Inconnu')).toBe(true);
  });

  test('une nuit en route décale l’arrivée au port', () => {
    expect(travelHours(paris.drivingSeconds, 'nuit')).toBeGreaterThan(travelHours(paris.drivingSeconds, 'relais') + 8);
    const night = assessDeparture(paris, '2026-07-29', 8, 'nuit');
    const relay = assessDeparture(paris, '2026-07-29', 8, 'relais');
    expect(night.arrivalAtPort > relay.arrivalAtPort).toBe(true);
  });

  test('un départ d’Espagne n’a pas de route française ; une origine inconnue est INCONNUE, pas fluide', () => {
    const madrid = tripFromRoutePage('madrid-tanger');
    if (madrid) expect(assessDeparture(madrid, '2026-08-04', 8, 'relais').frenchDays).toEqual([]);
    const unknown: Trip = { origin: 'Atlantis', drivingSeconds: 36000, franceShare: 0.5, port: 'Tarifa' };
    const a = assessDeparture(unknown, '2026-08-04', 8, 'relais');
    expect(a.combined).toBeNull();
    expect(a.reasons.some((r) => r.status === 'INCONNU')).toBe(true);
  });

  test('chaque raison porte un statut ; les sources officielles ont leur adresse', () => {
    const a = assessDeparture(paris, '2026-07-31', 18, 'relais');
    expect(a.reasons.every((r) => ['CONFIRMÉ', 'À VÉRIFIER', 'INFÉRENCE', 'INCONNU'].includes(r.status))).toBe(true);
    expect(a.reasons.some((r) => r.source?.includes('bison-fute.gouv.fr'))).toBe(true);
  });

  test('hors OPE, pas de pointe au port inventée', () => {
    expect(portLevel('2026-10-10').level).toBe(0);
  });
});
