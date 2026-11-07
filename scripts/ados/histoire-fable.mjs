// « Les Fables de la route » : quatre fables très anciennes (Ésope, La Fontaine, domaine public),
// réécrites avec nos mots, avec des personnages humains. Style « papier », ~1 minute chacune.
// Même format que histoire-nokta.mjs. Les clés de PERSOS sont des looks de dessin.js.

export const SERIE = {
  titre: 'Les Fables de la route',
  etiquette: 'FABLE',
  dossier: 'videos-fables',
  style: 'papier',
  duree: [30, 100], // secondes, pour le contrôle qualité
};

export const PERSOS = {
  voisin: { nom: 'Le marchand', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 1.0 },
  hote: { nom: 'Le beau parleur', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.88 },
  femme: { nom: 'La voisine', voix: 'EXAVITQu4vr4xnSDxMaL', hauteur: 1.0 },
  fils: { nom: 'Le jeune', voix: 'w85ZODduJOHPSdpVT1ia', hauteur: 1.25 },
  joha: { nom: 'Le vieux marcheur', voix: 'IbTlccXlWxGVwnbGUHEd', hauteur: 0.9 },
  sultan: { nom: 'Le sultan', voix: 'jvSOBXJ1cP2sdvT5RgUP', hauteur: 0.8 },
  narration: { nom: '', voix: 'azure:fr-FR-Soleil:MAI-Voice-2', hauteur: 1 },
};

const un = (id, x, emo = 'neutre', extra = {}) => ({ id, x, emo, ...extra });
const dit = (bg, parle, ton, texte, persos = [], extra = {}) => ({ bg, parle, ton, texte, persos, ...extra });

export const EPISODES = [
  {
    numero: 1,
    titre: 'Le marchand et le beau parleur',
    demain: 'Le chanteur et la voisine',
    question: 'Qui vous flatte pour obtenir quelque chose ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Un marchand sortait du marché avec un gros fromage sous le bras.', [un('voisin', -0.5, 'joie'), un('hote', 0.5, 'neutre')], { cam: 'pan' }),
      dit('rue', 'hote', 'honeyed, flattering', 'Quelle belle voix vous avez sûrement ! Chantez-moi quelque chose, je suis certain que c’est magnifique.', [un('voisin', -0.5, 'surprise'), un('hote', 0.5, 'joie')]),
      dit('rue', 'voisin', 'proud, cheerful', 'Vraiment ? Alors écoutez-moi bien !', [un('voisin', -0.5, 'joie'), un('hote', 0.5, 'joie')]),
      dit('rue', 'narration', 'warm, amused', 'Le marchand ouvrit la bouche pour chanter. Le fromage tomba, et le beau parleur le ramassa.', [un('voisin', -0.5, 'surprise'), un('hote', 0.5, 'joie')]),
      dit('rue', 'hote', 'smug, playful', 'Merci pour la leçon, mon ami : celui qui flatte vit toujours aux dépens de celui qui l’écoute.', [un('voisin', -0.5, 'triste'), un('hote', 0.5, 'joie')]),
      dit('rue', 'narration', 'warm, gentle', 'Méfie-toi de ceux qui te complimentent pour obtenir quelque chose.', [un('voisin', -0.5, 'tendre'), un('hote', 0.5, 'neutre')]),
    ],
  },
  {
    numero: 2,
    titre: 'Le chanteur et la voisine',
    demain: 'Le coureur et le vieux marcheur',
    question: 'Qu’avez-vous préparé pour l’hiver ?',
    plans: [
      dit('rue', 'narration', 'warm, storyteller', 'Tout l’été, un jeune chanteur jouait sur la place, pendant que sa voisine remplissait ses greniers.', [un('fils', -0.5, 'joie'), un('femme', 0.5, 'neutre')], { cam: 'pan' }),
      dit('rue', 'femme', 'kind, busy', 'Viens m’aider à ranger le blé, l’hiver sera long.', [un('fils', -0.5, 'joie'), un('femme', 0.5, 'tendre')]),
      dit('rue', 'fils', 'carefree, singing', 'Plus tard ! Aujourd’hui, je chante !', [un('fils', -0.5, 'joie', { act: 'rire' }), un('femme', 0.5, 'neutre')]),
      dit('dar', 'narration', 'warm, storyteller', 'L’hiver arriva. Le chanteur frappa à la porte de sa voisine, le ventre vide.', [un('fils', -0.5, 'triste'), un('femme', 0.5, 'neutre')]),
      dit('dar', 'fils', 'shivering, sad', 'J’ai froid, j’ai faim. Peux-tu m’aider ?', [un('fils', -0.5, 'triste'), un('femme', 0.5, 'tendre')]),
      dit('dar', 'femme', 'warm, firm', 'Je t’aiderai, mais cette fois tu m’aideras à ranger le blé. Chanter, c’est bien. Préparer, c’est mieux.', [un('fils', -0.5, 'tendre'), un('femme', 0.5, 'joie')]),
      dit('dar', 'narration', 'warm, gentle', 'Il faut un peu de chanson, et un peu de blé.', [un('fils', -0.5, 'joie'), un('femme', 0.5, 'joie')]),
    ],
  },
  {
    numero: 3,
    titre: 'Le coureur et le vieux marcheur',
    demain: 'Le sultan et le petit',
    question: 'Avancez-vous régulièrement, ou par à-coups ?',
    plans: [
      dit('route', 'narration', 'warm, storyteller', 'Un jeune coureur se moquait d’un vieux marcheur : je te battrai en riant !', [un('fils', -0.5, 'joie'), un('joha', 0.5, 'neutre')], { cam: 'pan' }),
      dit('route', 'joha', 'calm, smiling', 'Alors courons jusqu’à la fontaine. Qui arrive le premier a gagné.', [un('fils', -0.5, 'joie'), un('joha', 0.5, 'tendre')]),
      dit('route', 'narration', 'warm, amused', 'Le coureur partit comme le vent, puis s’allongea à l’ombre d’un figuier. Le vieux marcheur, lui, ne s’arrêta pas une seule fois.', [un('fils', -0.5, 'neutre'), un('joha', 0.5, 'joie')]),
      dit('route', 'fils', 'startled', 'Quoi ? Il est déjà à la fontaine ?', [un('fils', -0.5, 'surprise'), un('joha', 0.5, 'joie')]),
      dit('route', 'joha', 'gentle, wise', 'Pas si vite, mon garçon. Ce n’est pas la vitesse qui gagne, c’est la constance.', [un('fils', -0.5, 'triste'), un('joha', 0.5, 'tendre')]),
      dit('route', 'narration', 'warm, gentle', 'Celui qui avance un peu chaque jour finit par arriver.', [un('fils', -0.5, 'tendre'), un('joha', 0.5, 'joie')]),
    ],
  },
  {
    numero: 4,
    titre: 'Le sultan et le petit',
    demain: 'Le marchand et le beau parleur',
    question: 'Qui avez-vous déjà méprisé, et qui vous a aidé ?',
    plans: [
      dit('gala', 'narration', 'warm, storyteller', 'Un sultan se moquait d’un petit garçon qui ramassait des miettes près de son palais.', [un('sultan', -0.5, 'neutre'), un('fils', 0.5, 'triste')], { cam: 'pan' }),
      dit('gala', 'sultan', 'haughty, imposing', 'Que veux-tu, petit ? Tu ne vaux pas ma botte !', [un('sultan', -0.5, 'colere'), un('fils', 0.5, 'triste')]),
      dit('gala', 'narration', 'warm, storyteller', 'Quelques jours plus tard, le sultan resta pris dans un filet de chasseurs, et aucun garde ne vint.', [un('sultan', 0, 'peur')]),
      dit('gala', 'fils', 'brave, gentle', 'Restez calme, seigneur. Mes petites mains savent défaire les nœuds.', [un('sultan', -0.5, 'surprise'), un('fils', 0.5, 'tendre')]),
      dit('gala', 'sultan', 'humbled, warm', 'Toi qui m’as sauvé… Pardon de t’avoir méprisé.', [un('sultan', -0.5, 'tendre'), un('fils', 0.5, 'joie')]),
      dit('gala', 'narration', 'warm, gentle', 'Les petits aussi, un jour, sauvent les grands.', [un('sultan', -0.5, 'joie'), un('fils', 0.5, 'joie')]),
    ],
  },
];

export const avecVoix = (plan) => !!plan.parle;

export function texteParle(plan) {
  return `[${plan.ton}] ${plan.texte.replace(/\*/g, '')}`;
}
