import { ETABLISSEMENTS, problemes, visibles, type Etablissement } from '@/lib/etablissements'

const base: Etablissement = {
  id: 'exemple',
  nom: 'Exemple',
  categorie: 'garage',
  ville: 'Lyon',
  pays: 'FR',
  statut: 'CANDIDATE',
  source: 'Annuaire public',
  sourceUrl: 'https://exemple.fr/fiche',
  verifiedAt: '2026-11-05',
}

describe('annuaire des établissements', () => {
  it('chaque fiche du dépôt est valide et a un identifiant unique', () => {
    for (const e of ETABLISSEMENTS) expect({ id: e.id, erreurs: problemes(e) }).toEqual({ id: e.id, erreurs: [] })
    const ids = ETABLISSEMENTS.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('n’affiche jamais un simple candidat', () => {
    expect(visibles(ETABLISSEMENTS)).toEqual([])
    expect(visibles([base])).toEqual([])
  })

  it('exige un accord écrit pour afficher une fiche', () => {
    expect(problemes({ ...base, statut: 'REFERENCED' })).toContain('accord écrit obligatoire pour être affiché')
    const avecAccord = { ...base, statut: 'REFERENCED' as const, accord: 'Mail du 2026-11-10 de la gérante' }
    expect(problemes(avecAccord)).toEqual([])
    expect(visibles([avecAccord])).toEqual([avecAccord])
  })

  it('refuse une source sans lien https ou une date mal écrite', () => {
    expect(problemes({ ...base, sourceUrl: 'http://exemple.fr' })).toContain('source : lien https obligatoire')
    expect(problemes({ ...base, verifiedAt: '05/11/2026' })).toContain('date de vérification invalide')
  })

  it('ne met aucun numéro de téléphone dans le dépôt', () => {
    const texte = JSON.stringify(ETABLISSEMENTS)
    expect(texte).not.toMatch(/(?:\+33|\+34|\+212|\b0)[\s.]?[1-9](?:[\s.]?\d{2}){4}/)
  })
})
