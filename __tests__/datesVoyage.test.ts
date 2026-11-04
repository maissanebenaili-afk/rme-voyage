import { atPenaltyDh, dayNumber, formatDateFr, passportCheck, vehicleStay } from '@/lib/datesVoyage';

describe('dates', () => {
  it('refuse une date qui n’existe pas', () => {
    expect(dayNumber('2027-02-30')).toBeNull();
    expect(dayNumber('15/07/2027')).toBeNull();
    expect(dayNumber('2027-07-15')).not.toBeNull();
  });

  it('écrit la date en français', () => {
    expect(formatDateFr('2027-03-12')).toBe('12 mars 2027');
  });
});

describe('vehicleStay — 180 jours par année civile', () => {
  it('donne la date limite d’un premier séjour (jour d’entrée compté)', () => {
    const stay = vehicleStay({ entry: '2027-07-01', daysUsedBefore: 0, today: '2027-07-01' });
    expect(stay).toMatchObject({ status: 'ok', deadline: '2027-12-27', daysLeft: 180, penaltyDh: 0 });
  });

  it('retire les jours déjà passés au Maroc la même année', () => {
    const stay = vehicleStay({ entry: '2027-07-01', daysUsedBefore: 30, today: '2027-08-01' });
    expect(stay).toMatchObject({ status: 'ok', deadline: '2027-11-27', decemberExtension: false });
    if (stay.status === 'ok') expect(stay.daysLeft).toBe(119);
  });

  it('signale la prolongation possible quand l’admission finit à partir du 1er décembre', () => {
    expect(vehicleStay({ entry: '2027-07-01', daysUsedBefore: 0, today: '2027-07-01' })).toMatchObject({ decemberExtension: true });
    expect(vehicleStay({ entry: '2027-06-03', daysUsedBefore: 0, today: '2027-06-03' })).toMatchObject({
      deadline: '2027-11-29',
      decemberExtension: false,
    });
  });

  it('calcule le retard et l’amende du barème', () => {
    const stay = vehicleStay({ entry: '2027-01-10', daysUsedBefore: 0, today: '2027-08-01' });
    expect(stay).toMatchObject({ status: 'late', deadline: '2027-07-08', daysLate: 24, penaltyDh: 1000, daysLeft: 0 });
  });

  it('prévient qu’il ne reste aucun jour cette année', () => {
    expect(vehicleStay({ entry: '2027-09-01', daysUsedBefore: 180, today: '2027-09-01' })).toEqual({ status: 'no-days-left', year: 2027 });
  });

  it('refuse des données incohérentes', () => {
    expect(vehicleStay({ entry: '2027-13-01', daysUsedBefore: 0, today: '2027-07-01' })).toEqual({ status: 'invalid' });
    expect(vehicleStay({ entry: '2027-07-01', daysUsedBefore: -3, today: '2027-07-01' })).toEqual({ status: 'invalid' });
    expect(vehicleStay({ entry: '2027-07-01', daysUsedBefore: 2.5, today: '2027-07-01' })).toEqual({ status: 'invalid' });
  });

  it('suit le barème des pénalités du guide 2026', () => {
    expect([0, 1, 30, 31, 60, 61, 180, 181].map(atPenaltyDh)).toEqual([0, 1000, 1000, 2500, 2500, 5000, 5000, 10000]);
  });
});

describe('passportCheck — valable pendant tout le séjour', () => {
  it('valide un passeport qui dure après le retour', () => {
    expect(passportCheck({ expiry: '2028-01-10', returnDate: '2027-08-31', today: '2027-06-01' })).toEqual({ status: 'ok', daysAfterReturn: 132 });
  });

  it('prévient s’il expire pendant le voyage ou s’il a déjà expiré', () => {
    expect(passportCheck({ expiry: '2027-08-15', returnDate: '2027-08-31', today: '2027-06-01' })).toEqual({
      status: 'expires-during-trip',
      expiry: '2027-08-15',
    });
    expect(passportCheck({ expiry: '2027-05-01', returnDate: '2027-08-31', today: '2027-06-01' })).toEqual({ status: 'expired' });
  });

  it('accepte un passeport qui expire le jour du retour, refuse un retour dans le passé', () => {
    expect(passportCheck({ expiry: '2027-08-31', returnDate: '2027-08-31', today: '2027-06-01' })).toEqual({ status: 'ok', daysAfterReturn: 0 });
    expect(passportCheck({ expiry: '2028-01-10', returnDate: '2027-05-01', today: '2027-06-01' })).toEqual({ status: 'invalid' });
  });
});
