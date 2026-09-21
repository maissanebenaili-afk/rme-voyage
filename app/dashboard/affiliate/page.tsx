'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MousePointerClick, Target, Euro } from 'lucide-react';
import ConnectAccount from '@/components/affiliate/ConnectAccount';

type AffiliateStats = {
  program: string;
  clicks: number;
  conversions: number;
  revenue: number;
  rate: string;
};

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats[]>([
    { program: 'Airalo', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
    { program: 'Direct Ferries', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
    { program: 'Omio', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
  ]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadStats = async () => {
      try {
        const response = await fetch('/api/affiliate/stats', {
          headers: {
            'x-user-id': userId,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.programs);
          setTotalRevenue(data.totalRevenue);
        } else {
          console.error('Failed to load stats:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to load affiliate stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  const totalClicks = stats.reduce((sum, s) => sum + s.clicks, 0);
  const totalConversions = stats.reduce((sum, s) => sum + s.conversions, 0);
  const avgRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Tableau de bord affilié</h1>
          <p className="mt-2 text-lg text-slate-600">Suivi des ventes et revenus en temps réel</p>
        </div>

        {/* Stripe Connect Account */}
        {userId && (
          <div className="mb-8">
            <ConnectAccount userId={userId} />
          </div>
        )}

        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={MousePointerClick}
            label="Clics totaux"
            value={totalClicks.toString()}
            color="bg-blue-50 text-blue-600"
          />
          <MetricCard
            icon={Target}
            label="Conversions"
            value={totalConversions.toString()}
            color="bg-green-50 text-green-600"
          />
          <MetricCard
            icon={TrendingUp}
            label="Taux de conversion"
            value={avgRate + '%'}
            color="bg-purple-50 text-purple-600"
          />
          <MetricCard
            icon={Euro}
            label="Revenus estimés"
            value={'€' + totalRevenue.toFixed(2)}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Programs Table */}
        <div className="rounded-lg bg-white shadow-md overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5" />
              Performance par programme
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Chargement...</div>
          ) : stats.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-lg font-medium">Pas de données disponibles</p>
              <p className="mt-2">Commencez à partager vos liens affiliés pour voir les statistiques</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Programme</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Clics</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Taux</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Revenus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stats.map((program) => (
                    <tr key={program.program} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{program.program}</td>
                      <td className="px-6 py-4 text-slate-600">{program.clicks}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                          {program.conversions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{program.rate}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        €{program.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-6">
          <h3 className="font-semibold text-blue-900">À propos de ce tableau de bord</h3>
          <p className="mt-2 text-sm text-blue-800">
            Ce tableau de bord affiche les clics, conversions et revenus estimés de vos liens affiliés.
            Les données sont mises à jour en temps réel. Les revenus sont basés sur les taux de commission
            actuels et seront versés mensuellement une fois le seuil minimum atteint.
          </p>
          <div className="mt-4 space-y-1 text-sm text-blue-700">
            <p>💡 <strong>Conseil:</strong> Partagez vos liens dans les forums de voyage et groupes de destination</p>
            <p>📱 <strong>Airalo:</strong> ~5-15% par eSIM vendue (selon la région)</p>
            <p>⛴️ <strong>Direct Ferries:</strong> Commissions variables selon le type de traversée</p>
            <p>🚌 <strong>Omio:</strong> Jusqu'à 5% sur les réservations multimodales</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <Icon className="h-10 w-10 opacity-30" />
      </div>
    </div>
  );
}
