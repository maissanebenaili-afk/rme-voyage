// Freemium tier management and rate limiting

export type SubscriptionTier = 'free' | 'premium';

export interface FreemiumLimits {
  messagesPerDay: number;
  voiceInputEnabled: boolean;
  pdfExport: boolean;
  realtimeAlerts: boolean;
  prioritySupport: boolean;
  dailyResetTime: number; // hours (UTC)
  maxTipsPerDay: number;
  maxTripsCreated: number;
}

const TIER_LIMITS: Record<SubscriptionTier, FreemiumLimits> = {
  free: {
    messagesPerDay: 10,
    voiceInputEnabled: true,
    pdfExport: false,
    realtimeAlerts: false,
    prioritySupport: false,
    dailyResetTime: 0, // Midnight UTC
    maxTipsPerDay: 1,
    maxTripsCreated: 3,
  },
  premium: {
    messagesPerDay: 999999, // Unlimited
    voiceInputEnabled: true,
    pdfExport: true,
    realtimeAlerts: true,
    prioritySupport: true,
    dailyResetTime: 0,
    maxTipsPerDay: 50,
    maxTripsCreated: 999,
  },
};

export interface UserQuota {
  userId: string;
  tier: SubscriptionTier;
  messagesUsedToday: number;
  tipsCreatedToday: number;
  lastResetDate: string;
  resetTime: Date;
}

export function getLimits(tier: SubscriptionTier): FreemiumLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

export function getNextResetTime(resetHourUTC: number = 0): Date {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(resetHourUTC, 0, 0, 0);

  // If reset time has already passed today, set for tomorrow
  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  return nextReset;
}

export function hasExceededQuota(
  quota: UserQuota,
  limit: FreemiumLimits,
  quotaType: 'messages' | 'tips' = 'messages'
): boolean {
  // Check if we need to reset quota based on time
  const now = new Date();
  if (now > quota.resetTime) {
    return false; // Quota has reset, not exceeded
  }

  if (quotaType === 'messages') {
    return quota.messagesUsedToday >= limit.messagesPerDay;
  } else if (quotaType === 'tips') {
    return quota.tipsCreatedToday >= limit.maxTipsPerDay;
  }

  return false;
}

export function getRemainingQuota(
  quota: UserQuota,
  limit: FreemiumLimits,
  quotaType: 'messages' | 'tips' = 'messages'
): number {
  if (quotaType === 'messages') {
    return Math.max(0, limit.messagesPerDay - quota.messagesUsedToday);
  } else if (quotaType === 'tips') {
    return Math.max(0, limit.maxTipsPerDay - quota.tipsCreatedToday);
  }

  return 0;
}

export function incrementQuota(
  quota: UserQuota,
  quotaType: 'messages' | 'tips' = 'messages',
  amount: number = 1
): UserQuota {
  const updated = { ...quota };

  if (quotaType === 'messages') {
    updated.messagesUsedToday += amount;
  } else if (quotaType === 'tips') {
    updated.tipsCreatedToday += amount;
  }

  return updated;
}

export function formatQuotaMessage(
  tier: SubscriptionTier,
  used: number,
  limit: number
): string {
  const remaining = Math.max(0, limit - used);

  if (tier === 'premium') {
    return `Unlimited messages available`;
  }

  if (remaining === 0) {
    return `Daily limit reached (${limit}/${limit}). Upgrade to Premium for unlimited messages.`;
  }

  if (remaining === 1) {
    return `1 message remaining today. Upgrade to Premium for unlimited access.`;
  }

  return `${remaining}/${limit} messages remaining today. Upgrade to Premium for unlimited.`;
}

export function getPricingTiers(): Array<{
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
}> {
  return [
    {
      tier: 'free',
      name: 'Starter',
      price: 0,
      currency: 'USD',
      billingPeriod: 'forever',
      features: [
        '10 messages per day',
        'Voice input',
        'Community tips',
        'Basic trip planner',
        'Multi-language support',
      ],
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: 4.99,
      currency: 'USD',
      billingPeriod: 'month',
      features: [
        'Unlimited messages',
        'Voice input & output',
        'PDF export',
        'Real-time alerts',
        'Priority support',
        'Advanced trip planner',
        'Community contribution boost',
      ],
    },
  ];
}
