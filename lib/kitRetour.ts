// Kit « Retour au bled » : liste de papiers personnalisée pour un départ
// France → Maroc. Fonction pure, sans réseau : chaque élément cite sa source.
// `aVerifier` signale une règle que seules des sources non officielles
// confirment (guides MRE) ou sur laquelle elles divergent — l'interface doit
// l'afficher comme telle, jamais comme une certitude.

export type Transport = 'voiture' | 'avion' | 'ferry-pieton';
export type Nationalite = 'francaise' | 'marocaine' | 'binationale';

export interface KitAnswers {
  transport: Transport;
  nationalite: Nationalite;
  // Un mineur résidant en France voyage sans aucun titulaire de l'autorité parentale.
  mineurSansParent: boolean;
  // Seulement pour la voiture : la carte grise est-elle au nom du conducteur ?
  vehiculeAuNomDuConducteur: boolean;
}

export type KitCategory = 'identite' | 'enfants' | 'vehicule' | 'trajet' | 'sur-place';

export interface KitSource {
  label: string;
  url: string;
}

export interface KitItem {
  id: string;
  category: KitCategory;
  title: string;
  detail: string;
  source: KitSource;
  aVerifier: boolean;
}

const SOURCES = {
  diplomatieMaroc: {
    label: 'Conseils aux voyageurs — Maroc (diplomatie.gouv.fr)',
    url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/maroc/',
  },
  douaneAst: {
    label: 'Autorisation de sortie du territoire (douane.gouv.fr)',
    url: 'https://www.douane.gouv.fr/fiche/autorisation-de-sortie-du-territoire-ast-pour-les-mineurs',
  },
  justiceAst: {
    label: 'AST pour les mineurs (justice.gouv.fr)',
    url: 'https://www.justice.gouv.fr/node/3406',
  },
  douaneMaroc: {
    label: 'Administration des douanes marocaines (douane.gov.ma)',
    url: 'https://www.douane.gov.ma/',
  },
} satisfies Record<string, KitSource>;

export function buildKit(answers: KitAnswers): KitItem[] {
  const items: KitItem[] = [];
  const { transport, nationalite, mineurSansParent, vehiculeAuNomDuConducteur } = answers;

  if (nationalite === 'francaise' || nationalite === 'binationale') {
    items.push({
      id: 'passeport-francais',
      category: 'identite',
      title: 'Passeport valide pendant tout le séjour',
      detail:
        "La carte d'identité française seule ne suffit pas pour entrer au Maroc. Vérifiez la date d'expiration de chaque passeport, enfants compris.",
      source: SOURCES.diplomatieMaroc,
      aVerifier: false,
    });
  }
  if (nationalite === 'marocaine' || nationalite === 'binationale') {
    items.push({
      id: 'identite-marocaine',
      category: 'identite',
      title: 'Pièce d’identité marocaine en cours de validité',
      detail:
        'Passeport marocain ou CNIE. Vérifiez auprès de votre consulat quelle pièce est acceptée pour vous et vos enfants.',
      source: SOURCES.douaneMaroc,
      aVerifier: true,
    });
  }
  if (nationalite === 'binationale') {
    items.push({
      id: 'deux-nationalites',
      category: 'identite',
      title: 'Emportez les papiers des deux nationalités',
      detail:
        'Utilisez le même document à la sortie et au retour, et gardez le français pour rentrer en France.',
      source: SOURCES.diplomatieMaroc,
      aVerifier: true,
    });
  }

  if (mineurSansParent) {
    items.push({
      id: 'ast',
      category: 'enfants',
      title: 'Autorisation de sortie du territoire (formulaire Cerfa 15646*01)',
      detail:
        "Obligatoire pour un mineur résidant en France qui voyage sans ses parents. Formulaire à remplir en ligne, à imprimer et à signer par un parent, avec la copie de la pièce d'identité du parent signataire. Aucune démarche en mairie.",
      source: SOURCES.douaneAst,
      aVerifier: false,
    });
    items.push({
      id: 'ast-piece-enfant',
      category: 'enfants',
      title: "Pièce d'identité de l'enfant",
      detail: "Le passeport de l'enfant, en plus de l'autorisation et de la copie du document du parent.",
      source: SOURCES.justiceAst,
      aVerifier: false,
    });
  }

  if (transport === 'voiture') {
    items.push(
      {
        id: 'carte-grise',
        category: 'vehicule',
        title: 'Carte grise originale + permis de conduire',
        detail: 'Les originaux, pas des copies.',
        source: SOURCES.douaneMaroc,
        aVerifier: false,
      },
      {
        id: 'assurance-maroc',
        category: 'vehicule',
        title: 'Assurance valable au Maroc',
        detail:
          "Vérifiez que « MA » n'est pas barré sur votre carte verte. Sinon, une assurance frontière peut être prise à l'arrivée au port.",
        source: SOURCES.douaneMaroc,
        aVerifier: true,
      },
      {
        id: 'admission-temporaire',
        category: 'vehicule',
        title: 'Admission temporaire du véhicule (fiche D16 ter)',
        detail:
          "Délivrée gratuitement par la douane marocaine à l'entrée. Gardez-la jusqu'à la sortie. La voiture peut rester environ 180 jours par année civile ; ne la prêtez pas et ne la vendez pas sur place.",
        source: SOURCES.douaneMaroc,
        aVerifier: true,
      },
    );
    if (!vehiculeAuNomDuConducteur) {
      items.push({
        id: 'procuration',
        category: 'vehicule',
        title: 'Procuration du propriétaire du véhicule',
        detail:
          "Si la carte grise n'est pas à votre nom. Faites-la légaliser en mairie par prudence : les guides ne sont pas d'accord sur ce point.",
        source: SOURCES.douaneMaroc,
        aVerifier: true,
      });
    }
  }

  if (transport === 'voiture' || transport === 'ferry-pieton') {
    items.push({
      id: 'billet-ferry',
      category: 'trajet',
      title: 'Billet de ferry aller-retour',
      detail: 'Imprimé ou sur le téléphone, avec le nom de chaque passager et la plaque du véhicule.',
      source: SOURCES.douaneMaroc,
      aVerifier: false,
    });
  }
  if (transport === 'avion') {
    items.push({
      id: 'billet-avion',
      category: 'trajet',
      title: "Carte d'embarquement et règles bagages",
      detail: 'Vérifiez le poids autorisé par votre compagnie avant de remplir les valises.',
      source: SOURCES.diplomatieMaroc,
      aVerifier: false,
    });
  }

  items.push({
    id: 'ordonnances',
    category: 'sur-place',
    title: 'Médicaments dans leur boîte + ordonnances',
    detail: 'Gardez les traitements en cours dans le bagage à main.',
    source: SOURCES.diplomatieMaroc,
    aVerifier: false,
  });

  return items;
}

export const KIT_CATEGORY_LABELS: Record<KitCategory, string> = {
  identite: 'Identité',
  enfants: 'Enfants',
  vehicule: 'Voiture',
  trajet: 'Trajet',
  'sur-place': 'Sur place',
};
