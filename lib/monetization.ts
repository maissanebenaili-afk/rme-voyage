export type MonetizationLever = 'MICRO' | 'CORE' | 'STRATEGIC';
export type MonetizationStatus = 'VERIFIED' | 'CANDIDATE' | 'BLOCKED';

export type MonetizationProduct =
  | 'ferry'
  | 'flight'
  | 'hotel'
  | 'car_rental'
  | 'transfer'
  | 'esim'
  | 'luggage'
  | 'lead'
  | 'marketplace'
  | 'b2b';

export type MonetizationTrigger =
  | 'route_intent'
  | 'booking_intent'
  | 'destination_arrival'
  | 'connectivity_intent'
  | 'service_intent'
  | 'partner_demand';

export interface MonetizationOpportunity {
  id: string;
  provider: string;
  product: MonetizationProduct;
  lever: MonetizationLever;
  trigger: MonetizationTrigger;
  status: MonetizationStatus;
  /** Only populated when the commercial terms have been verified. */
  commissionRate?: number;
  /** Optional basket value observed or supplied by a trusted source. */
  basketValue?: number;
  /** Optional measured conversion probability in [0, 1]. */
  conversionProbability?: number;
  /** Complete partner URL supplied by the partner dashboard. */
  affiliateUrl?: string;
  evidence?: string;
}

export interface MonetizationContext {
  ferryIntent?: boolean;
  flightIntent?: boolean;
  hotelIntent?: boolean;
  carRentalIntent?: boolean;
  connectivityIntent?: boolean;
  luggageIntent?: boolean;
  serviceIntent?: boolean;
}

export interface MonetizationEstimate {
  opportunityId: string;
  expectedValue: number | null;
  reason?: string;
}

export interface MeasuredFunnel {
  clicks: number;
  bookings: number;
  observedBasketValue?: number;
}

/**
 * Binds measured funnel data to a commercial opportunity.
 * Conversion is derived only from observed clicks/bookings; no forecast is
 * created when the denominator or commercial terms are unavailable.
 */
export function estimateFromMeasuredFunnel(
  opportunity: MonetizationOpportunity,
  funnel: MeasuredFunnel,
): MonetizationEstimate {
  if (
    !Number.isFinite(funnel.clicks) ||
    !Number.isFinite(funnel.bookings) ||
    funnel.clicks <= 0 ||
    funnel.bookings < 0 ||
    funnel.bookings > funnel.clicks
  ) {
    return {
      opportunityId: opportunity.id,
      expectedValue: null,
      reason: 'invalid_funnel_measurement',
    };
  }

  if (
    funnel.observedBasketValue != null &&
    (!Number.isFinite(funnel.observedBasketValue) ||
      funnel.observedBasketValue < 0)
  ) {
    return {
      opportunityId: opportunity.id,
      expectedValue: null,
      reason: 'invalid_basket_measurement',
    };
  }

  const basketValue = funnel.observedBasketValue ?? opportunity.basketValue;
  if (opportunity.commissionRate == null || basketValue == null) {
    return {
      opportunityId: opportunity.id,
      expectedValue: null,
      reason: 'insufficient_verified_measurements',
    };
  }

  const conversionProbability = funnel.bookings / funnel.clicks;
  return estimateExpectedValue({
    ...opportunity,
    basketValue,
    conversionProbability,
  });
}

/**
 * Expected value is deliberately conservative:
 * rate × basket × measured conversion probability.
 * If one of these inputs is missing, no revenue is fabricated.
 */
export function estimateExpectedValue(
  opportunity: MonetizationOpportunity,
): MonetizationEstimate {
  const { commissionRate, basketValue, conversionProbability } = opportunity;

  if (
    commissionRate == null ||
    basketValue == null ||
    conversionProbability == null
  ) {
    return {
      opportunityId: opportunity.id,
      expectedValue: null,
      reason: 'insufficient_verified_measurements',
    };
  }

  if (
    !Number.isFinite(commissionRate) ||
    !Number.isFinite(basketValue) ||
    !Number.isFinite(conversionProbability) ||
    commissionRate < 0 ||
    basketValue < 0 ||
    conversionProbability < 0 ||
    conversionProbability > 1
  ) {
    return {
      opportunityId: opportunity.id,
      expectedValue: null,
      reason: 'invalid_measurement',
    };
  }

  return {
    opportunityId: opportunity.id,
    expectedValue: commissionRate * basketValue * conversionProbability,
  };
}

/**
 * Returns only opportunities whose user intent is currently relevant.
 * Candidates remain visible to the research layer but are not treated as
 * active monetization integrations.
 */
export function selectOpportunities(
  context: MonetizationContext,
  opportunities: readonly MonetizationOpportunity[],
): MonetizationOpportunity[] {
  return opportunities.filter((opportunity) => {
    if (opportunity.status !== 'VERIFIED') return false;

    switch (opportunity.product) {
      case 'ferry':
        return Boolean(context.ferryIntent);
      case 'flight':
        return Boolean(context.flightIntent);
      case 'hotel':
        return Boolean(context.hotelIntent);
      case 'car_rental':
        return Boolean(context.carRentalIntent);
      case 'esim':
        return Boolean(context.connectivityIntent);
      case 'luggage':
        return Boolean(context.luggageIntent);
      case 'lead':
      case 'marketplace':
      case 'b2b':
        return Boolean(context.serviceIntent);
      case 'transfer':
        return Boolean(context.serviceIntent);
      default:
        return false;
    }
  });
}

/**
 * Commercial catalogue. URLs and rates are intentionally absent until the
 * partner dashboard/contract has been verified for this project.
 */
export const monetizationCatalogue: readonly MonetizationOpportunity[] = [
  {
    id: 'direct-ferries-core',
    provider: 'Direct Ferries',
    product: 'ferry',
    lever: 'CORE',
    trigger: 'booking_intent',
    status: 'VERIFIED',
    evidence: 'Affiliate programme verified from the official partner programme.',
  },
  {
    id: 'travelpayouts-flight-core',
    provider: 'Travelpayouts',
    product: 'flight',
    lever: 'CORE',
    trigger: 'booking_intent',
    status: 'VERIFIED',
    evidence: 'Travel affiliate platform/programme access verified from official documentation.',
  },
  {
    id: 'travelpayouts-hotel-core',
    provider: 'Travelpayouts',
    product: 'hotel',
    lever: 'CORE',
    trigger: 'booking_intent',
    status: 'VERIFIED',
    evidence: 'Travel affiliate platform/programme access verified from official documentation.',
  },
  {
    id: 'esim-micro-candidate',
    provider: 'Airalo',
    product: 'esim',
    lever: 'MICRO',
    trigger: 'connectivity_intent',
    status: 'CANDIDATE',
    evidence: 'Affiliate programme identified; project account/terms must be verified before activation.',
  },
  {
    id: 'luggage-micro-candidate',
    provider: 'Local luggage partner',
    product: 'luggage',
    lever: 'MICRO',
    trigger: 'destination_arrival',
    status: 'CANDIDATE',
    evidence: 'Local partner opportunity identified; commercial terms must be verified before activation.',
  },
  {
    id: 'mre-leads-strategic',
    provider: 'RME Marketplace',
    product: 'lead',
    lever: 'STRATEGIC',
    trigger: 'service_intent',
    status: 'CANDIDATE',
    evidence: 'First-party lead model; pricing must be discovered from measured demand and signed partner terms.',
  },
  {
    id: 'mre-marketplace-strategic',
    provider: 'RME Marketplace',
    product: 'marketplace',
    lever: 'STRATEGIC',
    trigger: 'partner_demand',
    status: 'CANDIDATE',
    evidence: 'Opt-in supply marketplace; no private-group scraping or personal-number harvesting.',
  },
  {
    id: 'mre-b2b-strategic',
    provider: 'RME Data',
    product: 'b2b',
    lever: 'STRATEGIC',
    trigger: 'partner_demand',
    status: 'CANDIDATE',
    evidence: 'B2B product to be activated only after traffic and data quality are demonstrated.',
  },
];
