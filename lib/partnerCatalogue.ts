export type PartnerCategory =
  | "ferry"
  | "flight"
  | "hotel"
  | "esim"
  | "luggage"
  | "experiences"
  | "transfer"
  | "car_rental"
  | "insurance";

export type PartnerStatus = "active" | "pending";

export interface PartnerCatalogueEntry {
  id: string;
  name: string;
  category: PartnerCategory;
  description: string;
  status: PartnerStatus;
  affiliateUrl?: string;
  publicUrl: string;
  envVar: string;
  commissionNote: string;
}

type PartnerSeed = Omit<PartnerCatalogueEntry, "status" | "affiliateUrl"> & {
  allowedHosts: string[];
};

const seeds: PartnerSeed[] = [
  {
    id: "direct-ferries",
    name: "Direct Ferries",
    category: "ferry",
    description: "Comparaison de milliers de traversées et compagnies.",
    publicUrl: "https://www.directferries.fr/",
    envVar: "DIRECT_FERRIES_AFFILIATE_URL",
    allowedHosts: ["directferries.com", "www.directferries.com", "www.directferries.fr", "tp.media"],
    commissionNote: "Programme partenaire à activer avec le compte RME.",
  },
  {
    id: "travelpayouts-flights",
    name: "Travelpayouts · Vols",
    category: "flight",
    description: "Accès à des programmes de vols via une plateforme d'affiliation.",
    publicUrl: "https://www.travelpayouts.com/",
    envVar: "TRAVELPAYOUTS_FLIGHT_URL",
    allowedHosts: ["tp.media", "www.aviasales.com", "www.skyscanner.fr"],
    commissionNote: "Conditions variables selon le programme connecté.",
  },
  {
    id: "travelpayouts-hotels",
    name: "Travelpayouts · Hôtels",
    category: "hotel",
    description: "Hébergements à comparer avant réservation.",
    publicUrl: "https://www.travelpayouts.com/",
    envVar: "TRAVELPAYOUTS_HOTEL_URL",
    allowedHosts: ["tp.media"],
    commissionNote: "Programme hôtel à activer et mesurer.",
  },
  {
    id: "esim-morocco",
    name: "eSIM Morocco",
    category: "esim",
    description: "eSIM pour rester connecté pendant le séjour au Maroc.",
    publicUrl: "https://esimmorocco.org/",
    envVar: "ESIM_MOROCCO_AFFILIATE_URL",
    allowedHosts: ["esimmorocco.org"],
    commissionNote: "Programme annoncé par le partenaire ; compte RME à valider.",
  },
  {
    id: "lock-and-goo",
    name: "Lock & Gooo",
    category: "luggage",
    description: "Consigne à bagages à Agadir pour les voyageurs en transit.",
    publicUrl: "https://lockandgo.ma/",
    envVar: "LOCK_AND_GOO_AFFILIATE_URL",
    allowedHosts: ["lockandgo.ma"],
    commissionNote: "Programme partenaire local à activer.",
  },
  {
    id: "stash-and-go",
    name: "Stash & Go",
    category: "luggage",
    description: "Alternative de consigne à bagages à Agadir.",
    publicUrl: "https://stashandgo.ma/",
    envVar: "STASH_AND_GO_AFFILIATE_URL",
    allowedHosts: ["stashandgo.ma"],
    commissionNote: "Programme partenaire local à activer.",
  },
  {
    id: "ajili",
    name: "Ajili.ma",
    category: "experiences",
    description: "Expériences, visites et activités proposées au Maroc.",
    publicUrl: "https://ajili.ma/",
    envVar: "AJILI_AFFILIATE_URL",
    allowedHosts: ["ajili.ma", "www.ajili.ma"],
    commissionNote: "Programme d'affiliation à valider dans le compte RME.",
  },
  {
    id: "lgrima",
    name: "Lgrima",
    category: "transfer",
    description: "Service de transport local pour les voyageurs au Maroc.",
    publicUrl: "https://www.lgrima.com/",
    envVar: "LGRIMA_AFFILIATE_URL",
    allowedHosts: ["lgrima.com", "www.lgrima.com"],
    commissionNote: "Programme partenaire à activer.",
  },
  {
    id: "travelpayouts-car",
    name: "Travelpayouts · Location voiture",
    category: "car_rental",
    description: "Comparer des offres de location lorsque le voyage le justifie.",
    publicUrl: "https://www.travelpayouts.com/",
    envVar: "TRAVELPAYOUTS_CAR_URL",
    allowedHosts: ["tp.media"],
    commissionNote: "Programme à sélectionner dans le catalogue Travelpayouts.",
  },
  {
    id: "travelpayouts-insurance",
    name: "Travelpayouts · Assurance",
    category: "insurance",
    description: "Comparer une assurance voyage adaptée au séjour.",
    publicUrl: "https://www.travelpayouts.com/",
    envVar: "TRAVELPAYOUTS_INSURANCE_URL",
    allowedHosts: ["tp.media"],
    commissionNote: "Programme à sélectionner et vérifier avant activation.",
  },
];

function verifiedEnvUrl(value: string | undefined, allowedHosts: string[]): string | undefined {
  if (!value?.trim()) return undefined;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    return allowedHosts.includes(url.hostname) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function getPartnerCatalogue(): PartnerCatalogueEntry[] {
  return seeds.map(({ allowedHosts, ...seed }) => {
    const affiliateUrl = verifiedEnvUrl(process.env[seed.envVar], allowedHosts);
    return {
      ...seed,
      status: affiliateUrl ? "active" : "pending",
      ...(affiliateUrl ? { affiliateUrl } : {}),
    };
  });
}
