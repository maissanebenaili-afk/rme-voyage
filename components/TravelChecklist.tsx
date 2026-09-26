"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2, Plane, Ship, Car, FileText, Shield } from "lucide-react";
import { useTravelStorage } from "@/lib/travel/useTravelStorage";

type ChecklistItem = {
  id: string;
  label: string;
  category: "documents" | "vehicule" | "sante" | "logistique";
  icon: typeof FileText;
};

const defaultItems: ChecklistItem[] = [
  { id: "passport", label: "Passeport (validité > 6 mois)", category: "documents", icon: FileText },
  { id: "cnr", label: "Carte nationale d'immatriculation (véhicule)", category: "vehicule", icon: Car },
  { id: "insurance", label: "Assurance voyage / carte verte", category: "documents", icon: Shield },
  { id: "vaccines", label: "Carnet de vaccination à jour", category: "sante", icon: Shield },
  { id: "medicines", label: "Médicaments + ordonnances", category: "sante", icon: Shield },
  { id: "ferry-ticket", label: "Réservation ferry (aller-retour)", category: "logistique", icon: Ship },
  { id: "flight-ticket", label: "Billet d'avion (si applicable)", category: "logistique", icon: Plane },
  { id: "booking-accommodation", label: "Réservation hébergement", category: "logistique", icon: FileText },
  { id: "driver-license", label: "Permis de conduire (international recommandé)", category: "vehicule", icon: Car },
  { id: "cte", label: "Contrôle technique (si véhicule)", category: "vehicule", icon: Car },
];

// Couleurs -700 (plutôt que -600) : mesuré via rendu réel (Playwright) que
// text-emerald-600/text-amber-600 sur bg-emerald-50/bg-amber-50 tombent à
// 3.07-3.58:1, sous le seuil AA 4.5:1 pour ce texte de badge en gras 10px.
// Les teintes -700 mesurent 4.84-6.16:1 sur leurs fonds -50 respectifs.
const categoryLabels: Record<string, { label: string; color: string }> = {
  documents: { label: "Documents", color: "text-blue-700 bg-blue-50" },
  vehicule: { label: "Véhicule", color: "text-emerald-700 bg-emerald-50" },
  sante: { label: "Santé", color: "text-red-700 bg-red-50" },
  logistique: { label: "Logistique", color: "text-amber-700 bg-amber-50" },
};

// Default items are saved in the shared travel store under this prefix, so
// checklistProgress can later hold other lists (e.g. "pck:") side by side.
// Custom items have no stored label in TravelDataV1: they stay session-only.
export const CHECKLIST_PREFIX = "chk:";
const defaultIds = new Set(defaultItems.map((item) => item.id));

export default function TravelChecklist() {
  const { travel, updateTravel } = useTravelStorage();
  const [customChecked, setCustomChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");

  const checked = useMemo(() => {
    const saved = travel.checklistProgress
      .filter((key) => key.startsWith(CHECKLIST_PREFIX))
      .map((key) => key.slice(CHECKLIST_PREFIX.length))
      .filter((id) => defaultIds.has(id));
    return new Set([...saved, ...customChecked]);
  }, [travel.checklistProgress, customChecked]);

  const allItems = [...defaultItems, ...customItems];
  const progress = Math.round((checked.size / allItems.length) * 100);

  function toggle(id: string) {
    if (defaultIds.has(id)) {
      const key = `${CHECKLIST_PREFIX}${id}`;
      updateTravel((prev) => ({
        checklistProgress: prev.checklistProgress.includes(key)
          ? prev.checklistProgress.filter((entry) => entry !== key)
          : [...prev.checklistProgress, key],
      }));
      return;
    }
    setCustomChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addItem() {
    if (!newItem.trim()) return;
    const id = `custom-${Date.now()}`;
    setCustomItems((prev) => [
      ...prev,
      { id, label: newItem.trim(), category: "logistique", icon: FileText },
    ]);
    setNewItem("");
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">📋 Checklist voyage</h2>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {checked.size}/{allItems.length} ({progress}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        {allItems.map((item) => {
          const isChecked = checked.has(item.id);
          const cat = categoryLabels[item.category];
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isChecked ? "bg-emerald-50/50" : "hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={isChecked}
                aria-label={item.label}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all ${
                  isChecked
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-slate-300 text-transparent hover:border-emerald-400"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <Icon size={16} className={isChecked ? "text-slate-300" : "text-slate-400"} />
              <span
                className={`flex-1 text-sm ${
                  isChecked ? "text-slate-400 line-through" : "font-medium text-slate-700"
                }`}
              >
                {item.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.color}`}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add custom item */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Ajouter un élément..."
          className="flex-1 rounded-xl border p-2.5 text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          aria-label="Ajouter l'élément"
          className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800"
        >
          <Plus size={18} />
        </button>
      </div>

      {progress === 100 && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">
          ✅ Tout est prêt ! Bon voyage Europe ↔ Maroc 🌍
        </div>
      )}
    </section>
  );
}
