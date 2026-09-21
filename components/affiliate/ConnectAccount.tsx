'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

type ConnectStatus = {
  connected: boolean;
  status?: {
    id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    email?: string;
    country?: string;
  };
  balance?: {
    available: number;
    pending: number;
    currency: string;
  };
  onboarding_url?: string;
  verified_at?: string;
};

export default function ConnectAccount({ userId }: { userId: string }) {
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/affiliate/connect/status', {
          headers: {
            'x-user-id': userId,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Connect status');
        }

        const data = await response.json();
        setConnectStatus(data);
      } catch (err) {
        console.error('Error fetching Connect status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  const handleConnectClick = async () => {
    try {
      const response = await fetch('/api/affiliate/connect/auth-url', {
        method: 'POST',
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const { auth_url } = await response.json();
      window.location.href = auth_url;
    } catch (err) {
      console.error('Error initiating Connect flow:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow-md p-6">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Erreur de connexion</h3>
            <p className="mt-1 text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!connectStatus?.connected) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Connecter un compte Stripe</h3>
            <p className="mt-2 text-sm text-slate-600">
              Connectez votre compte Stripe pour recevoir vos commissions affiliées automatiquement
              chaque mois. Versements directs sur votre compte bancaire.
            </p>
            <button
              onClick={handleConnectClick}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              Connecter Stripe
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = connectStatus.status!;
  const balance = connectStatus.balance;
  const isFullyVerified = status.charges_enabled && status.payouts_enabled;

  return (
    <div className="rounded-lg bg-white shadow-md overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isFullyVerified ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Clock className="h-6 w-6 text-amber-600" />
            )}
            <div>
              <h3 className="font-semibold text-slate-900">Compte Stripe connecté</h3>
              <p className="text-sm text-slate-600">{status.email || status.id}</p>
            </div>
          </div>
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isFullyVerified
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isFullyVerified ? 'Actif' : 'Vérification en cours'}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Details */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Débits activés</p>
            <p className="mt-1 text-lg font-semibold">
              {status.charges_enabled ? '✓ Oui' : '✗ Non'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Versements activés</p>
            <p className="mt-1 text-lg font-semibold">
              {status.payouts_enabled ? '✓ Oui' : '✗ Non'}
            </p>
          </div>
          {status.country && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Pays</p>
              <p className="mt-1 text-lg font-semibold">{status.country.toUpperCase()}</p>
            </div>
          )}
        </div>

        {/* Balance Display */}
        {balance && isFullyVerified && (
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Solde disponible</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {balance.available.toFixed(2)} €
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">En attente</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {balance.pending.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding */}
        {!isFullyVerified && connectStatus.onboarding_url && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-900">
              Complétez votre profil Stripe pour activer les versements.
            </p>
            <a
              href={connectStatus.onboarding_url}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Compléter votre profil
              <span>→</span>
            </a>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs font-medium uppercase text-blue-900">Comment ça marche</p>
          <ul className="mt-2 space-y-2 text-sm text-blue-800">
            <li>✓ Les clics affiliés sont trackés automatiquement</li>
            <li>✓ Les conversions sont comptabilisées par nos partenaires</li>
            <li>✓ Les commissions sont calculées mensuellement</li>
            <li>✓ Les versements sont effectués le 1er du mois suivant</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
