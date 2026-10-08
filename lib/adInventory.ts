/**
 * RME monetisation primitive.
 *
 * This is an inventory contract, not an ad network integration.
 * No ad is selected or displayed by this layer.
 *
 * Product rule:
 * usefulness first -> transparent sponsorship -> explicit user choice.
 */

export type AdPlacement =
  | "RADIO_NOW"
  | "VIDEO_NOW"
  | "MOMENT"
  | "FEED"
  | "RESULTS";

export type AdFormat = "BANNER" | "NATIVE" | "SPONSOR_CARD" | "INTERSTITIAL";

export interface AdSlot {
  id: string;
  placement: AdPlacement;
  format: AdFormat;
  maxItems: number;
  label: "PUBLICITÉ" | "SPONSORISÉ";
  enabled: boolean;
  frequencyCap?: number;
}

export interface AdContext {
  placement: AdPlacement;
  locale?: string;
  countryCode?: string;
  contentCategory?: string;
  momentKind?: string;
}

/**
 * Conservative default inventory.
 * Audio/video content must never be interrupted by this contract itself.
 */
export const RME_AD_SLOTS: readonly AdSlot[] = [
  {
    id: "radio-now-sponsor",
    placement: "RADIO_NOW",
    format: "SPONSOR_CARD",
    maxItems: 1,
    label: "SPONSORISÉ",
    enabled: true,
    frequencyCap: 3,
  },
  {
    id: "video-now-native",
    placement: "VIDEO_NOW",
    format: "NATIVE",
    maxItems: 1,
    label: "PUBLICITÉ",
    enabled: true,
    frequencyCap: 3,
  },
  {
    id: "moment-native",
    placement: "MOMENT",
    format: "NATIVE",
    maxItems: 1,
    label: "PUBLICITÉ",
    enabled: true,
    frequencyCap: 2,
  },
  {
    id: "feed-native",
    placement: "FEED",
    format: "NATIVE",
    maxItems: 1,
    label: "PUBLICITÉ",
    enabled: true,
    frequencyCap: 3,
  },
] as const;

export function getAdSlots(context: AdContext): AdSlot[] {
  return RME_AD_SLOTS.filter(
    (slot) => slot.enabled && slot.placement === context.placement,
  ).map((slot) => ({ ...slot }));
}
