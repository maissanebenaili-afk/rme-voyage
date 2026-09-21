import { Check } from 'lucide-react';
import { PREMIUM_TIER_CONFIG } from '@/lib/stripe';

export default function PremiumFeatures() {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <h3 className="text-sm font-black uppercase tracking-wide text-amber-900">
        {PREMIUM_TIER_CONFIG.name}
      </h3>
      <div className="mt-1">
        <span className="text-3xl font-black text-amber-900">
          €{PREMIUM_TIER_CONFIG.price}
        </span>
        <span className="ml-2 text-sm text-amber-700">/mois</span>
      </div>

      <div className="mt-6 space-y-3">
        {PREMIUM_TIER_CONFIG.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check size={18} className="mt-0.5 flex-shrink-0 text-amber-700" />
            <span className="text-sm text-amber-900">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
