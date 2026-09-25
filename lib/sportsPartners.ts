import { verifiedPartnerUrl } from './bookingLinks';

export type SportsPartner = {
  id: string;
  name: string;
  url: string;
  affiliateUrl?: string;
  status: 'active' | 'pending';
};

const PARTNERS: Array<{
  id: string;
  name: string;
  publicUrl: string;
  env: string;
  hosts: string[];
}> = [
  {
    id: 'unibet',
    name: 'Unibet',
    publicUrl: 'https://www.unibet.fr/',
    env: 'UNIBET_AFFILIATE_URL',
    hosts: ['www.unibet.fr', 'unibet.fr'],
  },
  {
    id: 'betclic',
    name: 'Betclic',
    publicUrl: 'https://www.betclic.fr/',
    env: 'BETCLIC_AFFILIATE_URL',
    hosts: ['www.betclic.fr', 'betclic.fr'],
  },
  {
    id: 'winamax',
    name: 'Winamax',
    publicUrl: 'https://www.winamax.fr/',
    env: 'WINAMAX_AFFILIATE_URL',
    hosts: ['www.winamax.fr', 'winamax.fr'],
  },
  {
    id: 'bet365',
    name: 'bet365',
    publicUrl: 'https://www.bet365.fr/',
    env: 'BET365_AFFILIATE_URL',
    hosts: ['www.bet365.fr', 'bet365.fr'],
  },
];

function safeAffiliateUrl(value: string | undefined, hosts: string[]) {
  return verifiedPartnerUrl(value, 'other', hosts);
}

export function getSportsPartners(): SportsPartner[] {
  return PARTNERS.map((partner) => {
    const affiliateUrl = safeAffiliateUrl(process.env[partner.env], partner.hosts);
    return {
      id: partner.id,
      name: partner.name,
      url: affiliateUrl ?? partner.publicUrl,
      affiliateUrl,
      status: affiliateUrl ? 'active' : 'pending',
    };
  });
}

export const FALLBACK_ANALYSIS_SOURCES = [
  {
    id: 'afrik-foot',
    name: 'Afrik-Foot',
    description: 'Analyses et pronostics football africain',
    url: 'https://www.afrik-foot.com/',
  },
  {
    id: 'wincomparator',
    name: 'WinComparator',
    description: 'Pronostics, statistiques et comparateur',
    url: 'https://www.wincomparator.com/fr-fr/pronostics/',
  },
  {
    id: 'windrawwin',
    name: 'WinDrawWin',
    description: 'Prévisions et statistiques de matchs',
    url: 'https://www.windrawwin.com/tips/',
  },
] as const;
