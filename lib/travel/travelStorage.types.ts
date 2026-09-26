export type TravelMode = "car" | "ferry" | "plane" | "mixed" | null;

export interface TravelDataV1 {
  version: 1;
  villes: {
    depart: string;
    arrivee: string;
  };
  dateVoyage: string | null;
  modeTransport: TravelMode;
  checklistProgress: string[];
  preferences: Record<string, string | number | boolean | null>;
  derniereConsultation: string | null;
}

export type CurrentTravelData = TravelDataV1;

