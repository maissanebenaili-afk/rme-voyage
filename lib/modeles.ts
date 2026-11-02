// Modèles de documents à remplir en ligne puis imprimer. Rien n'est envoyé
// à un serveur : le texte est assemblé dans le navigateur. Seuls des actes
// sous signature privée sont proposés ici ; les formulaires officiels (AST,
// certificat de cession) restent des liens vers le site de l'État, car un
// Cerfa refait par nous ne serait pas valable.

export interface ChampModele {
  id: string;
  label: string;
  type: 'text' | 'date';
  placeholder?: string;
}

export type Valeurs = Record<string, string>;

const vide = (v: string | undefined) => (v && v.trim() ? v.trim() : '…………………………');

function dateFr(iso: string | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return vide(iso);
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export const CHAMPS_PROCURATION_VEHICULE: ChampModele[] = [
  { id: 'propNom', label: 'Propriétaire : nom et prénom', type: 'text' },
  { id: 'propNaissance', label: 'Propriétaire : date de naissance', type: 'date' },
  { id: 'propLieuNaissance', label: 'Propriétaire : lieu de naissance', type: 'text' },
  { id: 'propAdresse', label: 'Propriétaire : adresse', type: 'text' },
  { id: 'propPiece', label: "Propriétaire : pièce d'identité et numéro", type: 'text', placeholder: 'Passeport n° …' },
  { id: 'immat', label: 'Immatriculation', type: 'text', placeholder: 'AB-123-CD' },
  { id: 'marque', label: 'Marque et modèle', type: 'text' },
  { id: 'vin', label: 'Numéro de série (case E de la carte grise)', type: 'text' },
  { id: 'condNom', label: 'Conducteur : nom et prénom', type: 'text' },
  { id: 'condNaissance', label: 'Conducteur : date de naissance', type: 'date' },
  { id: 'condAdresse', label: 'Conducteur : adresse', type: 'text' },
  { id: 'condPermis', label: 'Conducteur : numéro du permis de conduire', type: 'text' },
  { id: 'debut', label: 'Valable du', type: 'date' },
  { id: 'fin', label: 'Valable jusqu’au', type: 'date' },
  { id: 'ville', label: 'Fait à (ville)', type: 'text' },
];

export function procurationVehicule(v: Valeurs): { titre: string; paragraphes: string[] } {
  return {
    titre: 'PROCURATION POUR LA CONDUITE D’UN VÉHICULE',
    paragraphes: [
      `Je soussigné(e) ${vide(v.propNom)}, né(e) le ${dateFr(v.propNaissance)} à ${vide(v.propLieuNaissance)}, demeurant ${vide(v.propAdresse)}, titulaire de la pièce d'identité suivante : ${vide(v.propPiece)},`,
      `propriétaire du véhicule ${vide(v.marque)}, immatriculé ${vide(v.immat)}, numéro de série ${vide(v.vin)},`,
      `autorise ${vide(v.condNom)}, né(e) le ${dateFr(v.condNaissance)}, demeurant ${vide(v.condAdresse)}, titulaire du permis de conduire n° ${vide(v.condPermis)},`,
      `à conduire ce véhicule en France et à l'étranger, notamment à le faire entrer au Maroc et à l'en faire sortir, du ${dateFr(v.debut)} au ${dateFr(v.fin)}.`,
      'Cette procuration ne vaut ni vente, ni cession, ni donation du véhicule, qui reste ma propriété.',
      `Fait à ${vide(v.ville)}, le ${'…………………………'}.`,
      'Signature du propriétaire, précédée de la mention « Bon pour procuration » (à signer devant l’agent de la mairie) :',
    ],
  };
}

export interface DocumentOfficiel {
  id: string;
  nom: string;
  pourquoi: string;
  url: string;
}

// Formulaires de l'État : on ne les recopie pas, on envoie vers la source.
export const DOCUMENTS_OFFICIELS: DocumentOfficiel[] = [
  {
    id: 'ast',
    nom: 'Autorisation de sortie du territoire d’un enfant (Cerfa 15646)',
    pourquoi: 'Pour un enfant qui voyage sans ses parents. À remplir en ligne sur le site officiel.',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F1359',
  },
  {
    id: 'cession',
    nom: 'Certificat de cession d’un véhicule (vente ou don)',
    pourquoi: 'Pour vendre ou donner une voiture immatriculée en France. La démarche se fait sur le site officiel.',
    url: 'https://www.service-public.fr/particuliers/vosdroits/R20300',
  },
  {
    id: 'legalisation',
    nom: 'Faire légaliser une signature à la mairie',
    pourquoi: 'C’est gratuit en mairie. Vous devez signer devant l’agent, avec votre pièce d’identité.',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F1411',
  },
];
