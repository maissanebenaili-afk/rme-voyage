'use client';

import { useState } from 'react';
import {
  Luggage,
  Plus,
  Check,
  X,
  Sparkles,
  RotateCcw,
  Plane,
  Moon,
  Sun,
  Heart,
  FileText,
  Smartphone,
  Pill,
  ShoppingBag,
  Camera,
} from 'lucide-react';

// ---------- Types ----------
type TripType = 'family' | 'solo' | 'business' | 'religious';
type Duration = 'weekend' | 'short' | 'long' | 'extended';
type Season = 'summer' | 'winter' | 'spring' | 'autumn';
type CategoryId =
  | 'documents'
  | 'electronics'
  | 'clothing'
  | 'health'
  | 'spiritual'
  | 'gifts'
  | 'misc';

interface PackingItem {
  id: string;
  name: string;
  category: CategoryId;
  checked: boolean;
  aiSuggested?: boolean;
  custom?: boolean;
}

interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: typeof FileText;
}

// ---------- Theme ----------
const THEME = {
  darkGreen: '#0d3f38',
  gold: '#eead59',
  cream: '#f8f7f2',
};

// ---------- Constants ----------
const CATEGORIES: CategoryMeta[] = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'clothing', label: 'Clothing', icon: Sun },
  { id: 'health', label: 'Health & Hygiene', icon: Pill },
  { id: 'spiritual', label: 'Spiritual', icon: Heart },
  { id: 'gifts', label: 'Gifts', icon: ShoppingBag },
  { id: 'misc', label: 'Miscellaneous', icon: Camera },
];

const TRIP_TYPES: { id: TripType; label: string; icon: typeof Luggage }[] = [
  { id: 'family', label: 'Family', icon: Luggage },
  { id: 'solo', label: 'Solo', icon: Plane },
  { id: 'business', label: 'Business', icon: FileText },
  { id: 'religious', label: 'Religious', icon: Heart },
];

const DURATIONS: { id: Duration; label: string; days: string }[] = [
  { id: 'weekend', label: 'Weekend', days: '2–3 days' },
  { id: 'short', label: 'Short', days: '4–7 days' },
  { id: 'long', label: 'Long', days: '8–15 days' },
  { id: 'extended', label: 'Extended', days: '16+ days' },
];

const SEASONS: { id: Season; label: string; icon: typeof Sun }[] = [
  { id: 'summer', label: 'Summer', icon: Sun },
  { id: 'winter', label: 'Winter', icon: Moon },
  { id: 'spring', label: 'Spring', icon: Sun },
  { id: 'autumn', label: 'Autumn', icon: Moon },
];

// ---------- Item Generators ----------
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateItems(tripType: TripType, duration: Duration, season: Season): PackingItem[] {
  const items: Omit<PackingItem, 'id' | 'checked'>[] = [];

  // --- Documents ---
  items.push({ name: 'Passport (valid 6+ months)', category: 'documents', aiSuggested: true });
  items.push({ name: 'CNIE (Moroccan ID)', category: 'documents', aiSuggested: true });
  items.push({ name: 'Flight / ferry tickets', category: 'documents', aiSuggested: true });
  items.push({ name: 'Hotel reservation confirmations', category: 'documents', aiSuggested: true });
  items.push({ name: 'Travel insurance documents', category: 'documents', aiSuggested: true });

  if (tripType === 'business') {
    items.push({ name: 'Business cards', category: 'documents', aiSuggested: true });
    items.push({ name: 'Meeting agenda / documents', category: 'documents', aiSuggested: true });
  }
  if (tripType === 'family') {
    items.push({ name: "Children's birth certificates", category: 'documents', aiSuggested: true });
    items.push({ name: 'Family medical records', category: 'documents', aiSuggested: true });
  }
  if (tripType === 'religious') {
    items.push({ name: 'Vaccination certificate (meningitis)', category: 'documents', aiSuggested: true });
    items.push({ name: 'Umrah / Hajj visa', category: 'documents', aiSuggested: true });
  }

  // --- Electronics ---
  items.push({ name: 'Phone + charger', category: 'electronics', aiSuggested: true });
  items.push({ name: 'Power bank (10,000+ mAh)', category: 'electronics', aiSuggested: true });
  items.push({ name: 'Universal power adapter (Type C/E)', category: 'electronics', aiSuggested: true });
  items.push({ name: 'Headphones / earbuds', category: 'electronics', aiSuggested: true });

  if (duration === 'long' || duration === 'extended') {
    items.push({ name: 'Laptop + charger', category: 'electronics', aiSuggested: true });
    items.push({ name: 'USB cable (spare)', category: 'electronics', aiSuggested: true });
  }
  if (tripType === 'business') {
    items.push({ name: 'Laptop + charger', category: 'electronics', aiSuggested: true });
    items.push({ name: 'Presentation clicker', category: 'electronics', aiSuggested: true });
  }

  // --- Clothing ---
  const clothingCount =
    duration === 'weekend' ? 4 : duration === 'short' ? 7 : duration === 'long' ? 12 : 16;

  items.push({
    name: `${clothingCount}× underwear`,
    category: 'clothing',
    aiSuggested: true,
  });
  items.push({ name: `${Math.ceil(clothingCount / 2)}× socks`, category: 'clothing', aiSuggested: true });
  items.push({ name: `${Math.ceil(clothingCount / 3)}× t-shirts`, category: 'clothing', aiSuggested: true });
  items.push({ name: 'Comfortable walking shoes', category: 'clothing', aiSuggested: true });

  if (season === 'summer') {
    items.push({ name: 'Light breathable shirts', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Shorts (modest length for Morocco)', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Sun hat / cap', category: 'clothing', aiSuggested: true });
  }
  if (season === 'winter') {
    items.push({ name: 'Warm jacket / coat', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Sweater / fleece', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Warm scarf', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Long pants', category: 'clothing', aiSuggested: true });
  }
  if (season === 'spring' || season === 'autumn') {
    items.push({ name: 'Light jacket / cardigan', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Layered outfits', category: 'clothing', aiSuggested: true });
  }
  if (tripType === 'religious') {
    items.push({ name: 'Ihram garments (if applicable)', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Modest prayer clothing', category: 'clothing', aiSuggested: true });
  }
  if (tripType === 'business') {
    items.push({ name: 'Business attire (2–3 outfits)', category: 'clothing', aiSuggested: true });
    items.push({ name: 'Dress shoes', category: 'clothing', aiSuggested: true });
  }

  // --- Health & Hygiene ---
  items.push({ name: 'Personal medications', category: 'health', aiSuggested: true });
  items.push({ name: 'First-aid kit', category: 'health', aiSuggested: true });
  items.push({ name: 'Toothbrush + toothpaste', category: 'health', aiSuggested: true });
  items.push({ name: 'Deodorant', category: 'health', aiSuggested: true });
  items.push({ name: 'Hand sanitizer', category: 'health', aiSuggested: true });

  if (season === 'summer') {
    items.push({ name: 'Sunscreen SPF 50+', category: 'health', aiSuggested: true });
    items.push({ name: 'After-sun lotion', category: 'health', aiSuggested: true });
    items.push({ name: 'Insect repellent', category: 'health', aiSuggested: true });
  }
  if (season === 'winter') {
    items.push({ name: 'Lip balm', category: 'health', aiSuggested: true });
    items.push({ name: 'Cold / flu medicine', category: 'health', aiSuggested: true });
  }
  if (tripType === 'family') {
    items.push({ name: "Children's medications", category: 'health', aiSuggested: true });
    items.push({ name: 'Wet wipes', category: 'health', aiSuggested: true });
  }

  // --- Spiritual ---
  if (tripType === 'religious' || tripType === 'family') {
    items.push({ name: 'Prayer mat (travel size)', category: 'spiritual', aiSuggested: true });
    items.push({ name: 'Quran app downloaded offline', category: 'spiritual', aiSuggested: true });
    items.push({ name: 'Qibla compass app', category: 'spiritual', aiSuggested: true });
    items.push({ name: 'Prayer schedule app', category: 'spiritual', aiSuggested: true });
    items.push({ name: 'Tasbih / prayer beads', category: 'spiritual', aiSuggested: true });
  } else {
    items.push({ name: 'Qibla compass app (optional)', category: 'spiritual', aiSuggested: true });
  }

  // --- Gifts (Moroccan specialties) ---
  items.push({ name: 'Moroccan dates (medjool)', category: 'gifts', aiSuggested: true });
  items.push({ name: 'Argan oil (cosmetic / culinary)', category: 'gifts', aiSuggested: true });
  items.push({ name: 'Leather goods (babouches, bags)', category: 'gifts', aiSuggested: true });
  items.push({ name: 'Moroccan tea set / teapot', category: 'gifts', aiSuggested: true });
  items.push({ name: 'Saffron / spices', category: 'gifts', aiSuggested: true });

  if (tripType === 'family') {
    items.push({ name: 'Board games / activities for kids', category: 'gifts', aiSuggested: true });
  }

  // --- Miscellaneous ---
  items.push({ name: 'Reusable water bottle', category: 'misc', aiSuggested: true });
  items.push({ name: 'Snacks for travel', category: 'misc', aiSuggested: true });
  items.push({ name: 'Moroccan SIM card (Maroc Telecom / Inwi)', category: 'misc', aiSuggested: true });
  items.push({ name: 'Cash in MAD (Moroccan Dirham)', category: 'misc', aiSuggested: true });

  if (season === 'summer') {
    items.push({ name: 'Sunglasses (UV protection)', category: 'misc', aiSuggested: true });
  }
  if (season === 'winter' || season === 'autumn') {
    items.push({ name: 'Travel umbrella', category: 'misc', aiSuggested: true });
  }
  if (duration === 'long' || duration === 'extended') {
    items.push({ name: 'Laundry bag', category: 'misc', aiSuggested: true });
    items.push({ name: 'Travel pillow', category: 'misc', aiSuggested: true });
  }

  return items.map((it) => ({ ...it, id: uid(), checked: false }));
}

// "Forgotten item" suggestions — context-aware, avoids duplicates
function getForgottenItems(
  tripType: TripType,
  season: Season,
  duration: Duration,
  existingNames: Set<string>
): Omit<PackingItem, 'id' | 'checked'>[] {
  const candidates: Omit<PackingItem, 'id' | 'checked'>[] = [
    { name: 'Photocopies of passport (separate bag)', category: 'documents', aiSuggested: true },
    { name: 'Emergency contact list', category: 'documents', aiSuggested: true },
    { name: 'Spare phone charger cable', category: 'electronics', aiSuggested: true },
    { name: 'Travel-size shampoo & conditioner', category: 'health', aiSuggested: true },
    { name: 'Razors / shaving kit', category: 'health', aiSuggested: true },
    { name: 'Moisturizer', category: 'health', aiSuggested: true },
    { name: 'Travel wallet / money belt', category: 'misc', aiSuggested: true },
    { name: 'Zip-lock bags', category: 'misc', aiSuggested: true },
    { name: 'Reading material / e-book', category: 'misc', aiSuggested: true },
    { name: 'Reusable shopping bag', category: 'misc', aiSuggested: true },
    { name: 'Moroccan phrasebook / translation app', category: 'misc', aiSuggested: true },
  ];

  if (season === 'summer') {
    candidates.push({ name: 'Aloe vera gel (sunburn relief)', category: 'health', aiSuggested: true });
    candidates.push({ name: 'Light scarf for sun protection', category: 'clothing', aiSuggested: true });
  }
  if (season === 'winter') {
    candidates.push({ name: 'Thermal underwear', category: 'clothing', aiSuggested: true });
    candidates.push({ name: 'Warm gloves', category: 'clothing', aiSuggested: true });
  }
  if (tripType === 'family') {
    candidates.push({ name: 'Small backpack for day trips', category: 'misc', aiSuggested: true });
    candidates.push({ name: "Children's entertainment (tablet, books)", category: 'misc', aiSuggested: true });
  }
  if (tripType === 'business') {
    candidates.push({ name: 'Portable projector (if presenting)', category: 'electronics', aiSuggested: true });
    candidates.push({ name: 'Spare business attire', category: 'clothing', aiSuggested: true });
  }
  if (duration === 'extended') {
    candidates.push({ name: 'Multi-plug extension cord', category: 'electronics', aiSuggested: true });
    candidates.push({ name: 'Travel-size detergent', category: 'health', aiSuggested: true });
  }

  return candidates.filter((c) => !existingNames.has(c.name.toLowerCase()));
}

// ---------- Component ----------
export default function SmartPacking() {
  const [tripType, setTripType] = useState<TripType>('family');
  const [duration, setDuration] = useState<Duration>('short');
  const [season, setSeason] = useState<Season>('summer');
  const [items, setItems] = useState<PackingItem[]>([]);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customCategory, setCustomCategory] = useState<CategoryId>('misc');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [showAIHint, setShowAIHint] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate AI "thinking" for a delightful delay
    setTimeout(() => {
      setItems(generateItems(tripType, duration, season));
      setGenerated(true);
      setGenerating(false);
    }, 900);
  };

  const handleReset = () => {
    setItems([]);
    setGenerated(false);
    setCustomInput('');
    setShowAIHint(null);
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const addCustomItem = () => {
    const name = customInput.trim();
    if (!name) return;
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        name,
        category: customCategory,
        checked: false,
        custom: true,
      },
    ]);
    setCustomInput('');
  };

  const handleAISuggest = () => {
    setAiSuggesting(true);
    setTimeout(() => {
      const existing = new Set(items.map((it) => it.name.toLowerCase()));
      const forgotten = getForgottenItems(tripType, season, duration, existing);
      if (forgotten.length === 0) {
        setShowAIHint("You've covered everything — your list looks complete!");
      } else {
        const pickCount = Math.min(3, forgotten.length);
        const picks = forgotten.slice(0, pickCount);
        setItems((prev) => [
          ...picks.map((p) => ({ ...p, id: uid(), checked: false })),
          ...prev,
        ]);
        setShowAIHint(`Added ${pickCount} item${pickCount > 1 ? 's' : ''} you might have forgotten.`);
      }
      setAiSuggesting(false);
      setTimeout(() => setShowAIHint(null), 4000);
    }, 700);
  };

  // Progress
  const totalItems = items.length;
  const checkedItems = items.filter((it) => it.checked).length;
  const progressPct = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  // Group items by category
  const itemsByCategory = (catId: CategoryId) => items.filter((it) => it.category === catId);

  return (
    <div
      className="packing-widget"
      style={{
        maxWidth: 880,
        margin: '0 auto',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        background: THEME.cream,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(13, 63, 56, 0.12)',
        border: `1px solid ${THEME.darkGreen}22`,
      }}
    >
      {/* ===== Header ===== */}
      <div
        className="packing-header"
        style={{
          background: `linear-gradient(135deg, ${THEME.darkGreen} 0%, #0a2e29 100%)`,
          padding: '32px 32px 28px',
          color: THEME.cream,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: THEME.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(238, 173, 89, 0.35)',
            }}
          >
            <Luggage size={26} color={THEME.darkGreen} strokeWidth={2.2} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Smart Packing List
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                opacity: 0.7,
                fontWeight: 500,
              }}
            >
              AI-powered packing for Europe ↔ Morocco travel
            </p>
          </div>
        </div>

        {generated && (
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: 0.85,
                }}
              >
                <span>Packing Progress</span>
                <span style={{ color: THEME.gold, fontWeight: 700 }}>
                  {checkedItems}/{totalItems} packed · {progressPct}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(248, 247, 242, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${THEME.gold} 0%, #f5c97a 100%)`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(248, 247, 242, 0.1)',
                border: '1px solid rgba(248, 247, 242, 0.2)',
                color: THEME.cream,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(248, 247, 242, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(248, 247, 242, 0.1)';
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ===== Body ===== */}
      <div style={{ padding: '28px 32px 32px' }}>
        {/* --- Selectors --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Trip Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: THEME.darkGreen,
                marginBottom: 10,
                opacity: 0.7,
              }}
            >
              Trip Type
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRIP_TYPES.map((t) => {
                const active = tripType === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTripType(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 12,
                      border: `2px solid ${active ? THEME.darkGreen : THEME.darkGreen + '22'}`,
                      background: active ? THEME.darkGreen : 'transparent',
                      color: active ? THEME.cream : THEME.darkGreen,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: THEME.darkGreen,
                marginBottom: 10,
                opacity: 0.7,
              }}
            >
              Duration
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DURATIONS.map((d) => {
                const active = duration === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      padding: '10px 18px',
                      borderRadius: 12,
                      border: `2px solid ${active ? THEME.darkGreen : THEME.darkGreen + '22'}`,
                      background: active ? THEME.darkGreen : 'transparent',
                      color: active ? THEME.cream : THEME.darkGreen,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: 80,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{d.label}</span>
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.65,
                        fontWeight: 500,
                      }}
                    >
                      {d.days}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Season */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: THEME.darkGreen,
                marginBottom: 10,
                opacity: 0.7,
              }}
            >
              Season
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SEASONS.map((s) => {
                const active = season === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeason(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 12,
                      border: `2px solid ${active ? THEME.darkGreen : THEME.darkGreen + '22'}`,
                      background: active ? THEME.darkGreen : 'transparent',
                      color: active ? THEME.cream : THEME.darkGreen,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          {!generated && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '16px 24px',
                borderRadius: 14,
                border: 'none',
                background: generating
                  ? `linear-gradient(135deg, #0a2e29 0%, ${THEME.darkGreen} 100%)`
                  : `linear-gradient(135deg, ${THEME.gold} 0%, #f5c97a 100%)`,
                color: THEME.darkGreen,
                fontSize: 15,
                fontWeight: 800,
                cursor: generating ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: generating
                  ? 'none'
                  : '0 8px 24px rgba(238, 173, 89, 0.4)',
                width: '100%',
              }}
            >
              {generating ? (
                <>
                  <Sparkles size={20} className="sparkle-spin" />
                  Generating your smart list...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Smart List
                </>
              )}
            </button>
          )}
        </div>

        {/* --- AI Hint Toast --- */}
        {showAIHint && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 12,
              background: `${THEME.gold}22`,
              border: `1px solid ${THEME.gold}55`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              color: THEME.darkGreen,
              animation: 'slideIn 0.3s ease',
            }}
          >
            <Sparkles size={16} color={THEME.gold} />
            {showAIHint}
          </div>
        )}

        {/* --- Empty State --- */}
        {!generated && !generating && (
          <div
            style={{
              marginTop: 8,
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: `${THEME.darkGreen}08`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${THEME.darkGreen}30`,
              }}
            >
              <Luggage size={40} color={THEME.darkGreen} strokeWidth={1.5} opacity={0.4} />
            </div>
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 18,
                fontWeight: 700,
                color: THEME.darkGreen,
              }}
            >
              Your smart packing list awaits
            </h3>
            <p
              style={{
                margin: '0 auto',
                fontSize: 14,
                color: THEME.darkGreen,
                opacity: 0.55,
                maxWidth: 400,
                lineHeight: 1.6,
              }}
            >
              Select your trip type, duration, and season — then let AI craft a personalized
              packing list with documents, electronics, clothing, spiritual items, and Moroccan
              gift suggestions.
            </p>
          </div>
        )}

        {/* --- Generating State --- */}
        {generating && (
          <div
            style={{
              marginTop: 8,
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: `${THEME.gold}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles
                size={32}
                color={THEME.gold}
                strokeWidth={2}
                className="sparkle-spin"
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: THEME.darkGreen,
                opacity: 0.6,
              }}
            >
              Analyzing your trip context...
            </p>
          </div>
        )}

        {/* --- Packing List --- */}
        {generated && !generating && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Suggest Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 14,
                background: `linear-gradient(135deg, ${THEME.darkGreen}08 0%, ${THEME.gold}10 100%)`,
                border: `1px solid ${THEME.darkGreen}15`,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: THEME.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles
                  size={18}
                  color={THEME.darkGreen}
                  strokeWidth={2.2}
                  className={aiSuggesting ? 'sparkle-spin' : ''}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.darkGreen,
                  }}
                >
                  {aiSuggesting ? 'Thinking of what you might have forgotten...' : 'AI Smart Suggest'}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: THEME.darkGreen,
                    opacity: 0.55,
                    marginTop: 2,
                  }}
                >
                  Context-aware suggestions based on your trip
                </div>
              </div>
              <button
                onClick={handleAISuggest}
                disabled={aiSuggesting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: THEME.darkGreen,
                  color: THEME.cream,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: aiSuggesting ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={14} />
                {aiSuggesting ? '...' : 'AI Suggest'}
              </button>
            </div>

            {/* Categories */}
            {CATEGORIES.map((cat) => {
              const catItems = itemsByCategory(cat.id);
              if (catItems.length === 0) return null;
              const Icon = cat.icon;
              const catChecked = catItems.filter((it) => it.checked).length;

              return (
                <div
                  key={cat.id}
                  style={{
                    borderRadius: 16,
                    background: '#fff',
                    border: `1px solid ${THEME.darkGreen}12`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Category Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 18px',
                      borderBottom: `1px solid ${THEME.darkGreen}0e`,
                      background: `${THEME.darkGreen}04`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${THEME.darkGreen}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={THEME.darkGreen} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: THEME.darkGreen,
                        }}
                      >
                        {cat.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: THEME.darkGreen,
                          opacity: 0.5,
                          marginTop: 1,
                        }}
                      >
                        {catChecked}/{catItems.length} packed
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '6px 8px' }}>
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="packing-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 10,
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleItem(item.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${THEME.darkGreen}06`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 7,
                            border: `2px solid ${item.checked ? THEME.gold : THEME.darkGreen + '30'}`,
                            background: item.checked ? THEME.gold : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                          }}
                        >
                          {item.checked && <Check size={14} color={THEME.darkGreen} strokeWidth={3} />}
                        </div>

                        {/* Item name */}
                        <span
                          style={{
                            flex: 1,
                            fontSize: 14,
                            fontWeight: 500,
                            color: item.checked ? THEME.darkGreen : '#1a1a1a',
                            opacity: item.checked ? 0.5 : 1,
                            textDecoration: item.checked ? 'line-through' : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          {item.name}
                        </span>

                        {/* Badges */}
                        {item.aiSuggested && !item.custom && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: `${THEME.gold}22`,
                              color: '#b8862e',
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              flexShrink: 0,
                            }}
                          >
                            <Sparkles size={9} />
                            AI
                          </span>
                        )}
                        {item.custom && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: `${THEME.darkGreen}10`,
                              color: THEME.darkGreen,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              flexShrink: 0,
                            }}
                          >
                            <Plus size={9} />
                            Custom
                          </span>
                        )}

                        {/* Remove */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: 'none',
                            background: 'transparent',
                            color: THEME.darkGreen,
                            opacity: 0.3,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.3';
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = THEME.darkGreen;
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add Custom Item */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 18px',
                borderRadius: 14,
                background: '#fff',
                border: `2px dashed ${THEME.darkGreen}25`,
              }}
            >
              <Plus size={20} color={THEME.darkGreen} opacity={0.5} />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                placeholder="Add a custom item..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontWeight: 500,
                  color: THEME.darkGreen,
                  fontFamily: 'inherit',
                }}
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as CategoryId)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: `1px solid ${THEME.darkGreen}25`,
                  background: THEME.cream,
                  fontSize: 12,
                  fontWeight: 600,
                  color: THEME.darkGreen,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addCustomItem}
                disabled={!customInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: customInput.trim() ? THEME.darkGreen : THEME.darkGreen + '30',
                  color: THEME.cream,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: customInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <div
        style={{
          padding: '16px 32px',
          background: `${THEME.darkGreen}06`,
          borderTop: `1px solid ${THEME.darkGreen}0e`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 600,
          color: THEME.darkGreen,
          opacity: 0.5,
        }}
      >
        <Sparkles size={12} />
        Smart Packing · Europe ↔ Morocco Travel Assistant
      </div>

      {/* ===== Inline Styles ===== */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sparkle-spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 600px) {
          .packing-widget {
            border-radius: 0;
          }
          .packing-header {
            padding: 24px 20px 22px;
          }
        }
      `}</style>
    </div>
  );
}
