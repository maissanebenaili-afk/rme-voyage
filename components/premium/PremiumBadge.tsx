'use client';

import { Crown } from 'lucide-react';

export type PremiumStatus = 'free' | 'premium' | 'loading';

type Props = {
  status: PremiumStatus;
  className?: string;
};

const CONFIG: Record<PremiumStatus, { label: string; bg: string; text: string }> = {
  free: { label: 'Compte gratuit', bg: 'bg-gray-100', text: 'text-gray-700' },
  premium: { label: 'Premium actif', bg: 'bg-amber-100', text: 'text-amber-700' },
  loading: { label: '…', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export default function PremiumBadge({ status, className = '' }: Props) {
  const config = CONFIG[status];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text} ${className}`}>
      <Crown size={14} />
      <span>{config.label}</span>
    </div>
  );
}
