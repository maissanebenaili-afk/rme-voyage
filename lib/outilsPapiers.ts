// Boîte à outils « papiers » : liens gratuits pour scanner, transformer,
// signer, envoyer et suivre un dossier, rangés dans l'ordre d'une démarche.
// Textes courts, pensés pour être lus à voix haute (personnes qui lisent
// difficilement). `enLigne` signale un outil qui envoie le fichier sur un
// serveur tiers : l'interface doit le dire avant un document d'identité.

export type EtapeId = 'scanner' | 'transformer' | 'signer' | 'comprendre' | 'deposer' | 'aide';

export interface Outil {
  id: string;
  nom: string;
  phrase: string;
  url: string;
  gratuit: true;
  enLigne: boolean;
}

export interface Etape {
  id: EtapeId;
  emoji: string;
  titre: string;
  outils: Outil[];
}

export const ETAPES: Etape[] = [
  {
    id: 'scanner',
    emoji: '📷',
    titre: '1. Prendre le papier en photo',
    outils: [
      {
        id: 'scan-android',
        nom: 'Scanner avec un téléphone Android',
        phrase: "L'application Google Drive, déjà sur le téléphone, transforme une photo en document propre.",
        url: 'https://support.google.com/drive/answer/3145835?hl=fr',
        gratuit: true,
        enLigne: false,
      },
      {
        id: 'scan-iphone',
        nom: 'Scanner avec un iPhone',
        phrase: "L'application Notes de l'iPhone sait scanner un papier, sans rien installer.",
        url: 'https://support.apple.com/fr-fr/108963',
        gratuit: true,
        enLigne: false,
      },
    ],
  },
  {
    id: 'transformer',
    emoji: '🔄',
    titre: '2. Mettre au bon format',
    outils: [
      {
        id: 'photo-en-pdf',
        nom: 'Photo → PDF',
        phrase: 'Les sites officiels demandent souvent un PDF. Cet outil transforme vos photos en PDF.',
        url: 'https://tools.pdf24.org/fr/jpg-en-pdf',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'compresser',
        nom: 'Rendre le PDF plus léger',
        phrase: 'Si le site dit « fichier trop lourd », cet outil réduit la taille du PDF.',
        url: 'https://tools.pdf24.org/fr/compresser-pdf',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'fusionner',
        nom: 'Mettre plusieurs PDF en un seul',
        phrase: 'Pour envoyer tout le dossier en un seul fichier.',
        url: 'https://tools.pdf24.org/fr/fusionner-pdf',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'libreoffice',
        nom: 'LibreOffice (logiciel libre pour ordinateur)',
        phrase: 'Pour écrire une lettre et la garder en PDF, sans internet. Gratuit et libre.',
        url: 'https://fr.libreoffice.org/',
        gratuit: true,
        enLigne: false,
      },
    ],
  },
  {
    id: 'signer',
    emoji: '✍️',
    titre: '3. Remplir et signer',
    outils: [
      {
        id: 'editer-pdf',
        nom: 'Écrire dans un PDF',
        phrase: 'Pour remplir un formulaire PDF sans l’imprimer.',
        url: 'https://tools.pdf24.org/fr/editeur-pdf',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'signer-pdf',
        nom: 'Signer un PDF',
        phrase: 'Pour ajouter votre signature avec le doigt, sur le téléphone.',
        url: 'https://tools.pdf24.org/fr/signer-pdf',
        gratuit: true,
        enLigne: true,
      },
    ],
  },
  {
    id: 'comprendre',
    emoji: '🌍',
    titre: '4. Comprendre un papier',
    outils: [
      {
        id: 'google-traduction',
        nom: 'Traduire avec la caméra',
        phrase: 'Google Traduction lit un papier avec la caméra et le traduit, en arabe par exemple.',
        url: 'https://translate.google.com/',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'deepl',
        nom: 'Traduire un texte ou un document',
        phrase: 'DeepL traduit une lettre entière de façon naturelle.',
        url: 'https://www.deepl.com/fr/translator',
        gratuit: true,
        enLigne: true,
      },
    ],
  },
  {
    id: 'deposer',
    emoji: '📨',
    titre: '5. Déposer et suivre son dossier',
    outils: [
      {
        id: 'service-public',
        nom: 'Service-Public.fr',
        phrase: 'Le site officiel de toutes les démarches en France, avec un espace pour suivre vos dossiers.',
        url: 'https://www.service-public.fr/',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'ants',
        nom: 'ANTS : passeport, carte d’identité, permis, carte grise',
        phrase: 'Le seul site officiel pour ces papiers. Les autres sites qui les vendent sont payants et inutiles.',
        url: 'https://ants.gouv.fr/',
        gratuit: true,
        enLigne: true,
      },
      {
        id: 'ast',
        nom: 'Autorisation de sortie du territoire d’un enfant',
        phrase: 'Le formulaire officiel pour un enfant qui voyage sans ses parents.',
        url: 'https://www.service-public.fr/particuliers/vosdroits/F1359',
        gratuit: true,
        enLigne: true,
      },
    ],
  },
  {
    id: 'aide',
    emoji: '🤝',
    titre: '6. Se faire aider par une personne',
    outils: [
      {
        id: 'france-services',
        nom: 'France services : aide gratuite près de chez vous',
        phrase: 'Un agent vous aide en face à face pour vos papiers : CAF, impôts, retraite, titres. C’est gratuit.',
        url: 'https://www.france-services.gouv.fr/',
        gratuit: true,
        enLigne: false,
      },
    ],
  },
];

export function texteALire(outil: Outil): string {
  const prudence = outil.enLigne ? ' Attention : le fichier part sur internet.' : '';
  return `${outil.nom}. ${outil.phrase}${prudence}`;
}
