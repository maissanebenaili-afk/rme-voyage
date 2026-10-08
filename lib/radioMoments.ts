import type { RadioMoment, RadioSearchQuery, RadioStation } from "./radioTypes";
import { searchRadioStations } from "./radioBrowser";

export function createRadioMoment(
  stations: RadioStation[],
  reason = "Sélection adaptée à votre contexte",
): RadioMoment {
  return {
    kind: "RADIO",
    title: "Radio maintenant",
    reason,
    stations: stations.slice(0, 3),
  };
}

export async function buildRadioMoment(
  query: RadioSearchQuery,
  reason?: string,
): Promise<RadioMoment> {
  const stations = await searchRadioStations(query);
  return createRadioMoment(stations, reason);
}

export function radioQueryForContext(context: {
  countryCode?: string;
  language?: string;
  activity?: "DRIVING" | "HOME" | "TRAVEL";
}): RadioSearchQuery {
  const query: RadioSearchQuery = {
    countryCode: context.countryCode,
    language: context.language,
    limit: 12,
  };

  if (context.activity === "DRIVING") query.tag = "news";
  if (context.activity === "HOME") query.tag = "music";

  return query;
}
