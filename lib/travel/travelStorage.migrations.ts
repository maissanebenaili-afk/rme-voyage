import type {
  CurrentTravelData,
  TravelMode,
  UnversionedStoragePayload,
} from "./travelStorage.types";

export const CURRENT_VERSION = 1;

export function createDefaultTravelState(): CurrentTravelData {
  return {
    version: CURRENT_VERSION,
    villes: {
      depart: "",
      arrivee: "",
    },
    dateVoyage: null,
    modeTransport: null,
    checklistProgress: [],
    preferences: {},
    derniereConsultation: null,
  };
}

export function isValidTravelDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function isValidIsoTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    return false;
  }

  const datePart = value.slice(0, 10);
  const date = new Date(value);
  return isValidTravelDate(datePart) && !Number.isNaN(date.getTime());
}

export function migrateAndValidateTravelData(
  payload: UnversionedStoragePayload,
): CurrentTravelData {
  if (
    payload === null ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new TypeError("Payload racine invalide.");
  }

  if (payload.version !== CURRENT_VERSION) {
    throw new Error(`Version non supportee : ${String(payload.version)}`);
  }

  return enforceV1StrictRules(payload);
}

function enforceV1StrictRules(
  data: Record<string, unknown>,
): CurrentTravelData {
  if (
    data.villes === null ||
    typeof data.villes !== "object" ||
    Array.isArray(data.villes)
  ) {
    throw new TypeError("Structure 'villes' invalide.");
  }

  const villes = data.villes as Record<string, unknown>;

  if (
    typeof villes.depart !== "string" ||
    typeof villes.arrivee !== "string"
  ) {
    throw new TypeError("Champs 'depart' et 'arrivee' invalides.");
  }

  if (data.dateVoyage !== null && !isValidTravelDate(data.dateVoyage)) {
    throw new TypeError("Champ 'dateVoyage' invalide.");
  }

  const validModes: TravelMode[] = ["car", "ferry", "plane", "mixed", null];
  if (!validModes.includes(data.modeTransport as TravelMode)) {
    throw new TypeError("Mode de transport inconnu.");
  }

  if (
    !Array.isArray(data.checklistProgress) ||
    !data.checklistProgress.every((item) => typeof item === "string")
  ) {
    throw new TypeError(
      "Champ 'checklistProgress' doit etre un tableau de chaines.",
    );
  }

  if (
    data.preferences === null ||
    typeof data.preferences !== "object" ||
    Array.isArray(data.preferences)
  ) {
    throw new TypeError("Champ 'preferences' invalide.");
  }

  const preferences: CurrentTravelData["preferences"] = {};
  for (const [key, value] of Object.entries(data.preferences)) {
    if (
      typeof value !== "string" &&
      typeof value !== "number" &&
      typeof value !== "boolean" &&
      value !== null
    ) {
      throw new TypeError(`Type illegal pour la preference '${key}'.`);
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new TypeError(`Nombre non fini pour la preference '${key}'.`);
    }
    preferences[key] = value;
  }

  if (
    data.derniereConsultation !== null &&
    !isValidIsoTimestamp(data.derniereConsultation)
  ) {
    throw new TypeError("Champ 'derniereConsultation' invalide.");
  }

  return {
    version: CURRENT_VERSION,
    villes: {
      depart: villes.depart,
      arrivee: villes.arrivee,
    },
    dateVoyage: data.dateVoyage as string | null,
    modeTransport: data.modeTransport as TravelMode,
    checklistProgress: [...data.checklistProgress],
    preferences,
    derniereConsultation: data.derniereConsultation as string | null,
  };
}
