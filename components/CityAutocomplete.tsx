"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchCitySuggestions, type CitySuggestion } from "@/lib/geocoding";

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect: (result: CitySuggestion) => void;
  icon?: React.ReactNode;
  /** Longueur max du champ texte ; alignée sur la limite du lien de partage (~120). */
  maxLength?: number;
};

export default function CityAutocomplete({
  label,
  value,
  placeholder,
  onChange,
  onSelect,
  icon,
  maxLength = 120,
}: Props) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const optionIdPrefix = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Suggestions locales instantanées : aucun appel réseau, aucun debounce,
  // aucun timeout. Filtrage synchrone sur une liste statique (voir
  // lib/geocoding.ts) — conforme à la politique d'usage Nominatim qui
  // interdit l'autocomplétion côté client contre son API.
  function handleInputChange(next: string) {
    onChange(next);

    const results = searchCitySuggestions(next);
    setSuggestions(results);
    setOpen(results.length > 0);
    setActiveIndex(-1);
  }

  // Important : on met d'abord à jour le texte (onChange) AVANT de propager
  // la sélection (onSelect). Sinon, dans RouteSearch, le onChange du champ
  // réinitialise les coordonnées juste après qu'onSelect les ait posées, et
  // la sélection est perdue immédiatement.
  function handleSelect(result: CitySuggestion) {
    onChange(result.displayName);
    onSelect(result);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const activeOptionId =
    activeIndex >= 0 ? `${optionIdPrefix}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          {icon ?? <MapPin size={12} />} {label}
        </span>
        <div className="relative mt-1">
          <input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border p-3 pr-8 min-h-[44px]"
            aria-label={label}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            maxLength={maxLength}
          />
        </div>
      </label>

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.displayName}
              id={`${optionIdPrefix}-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
            >
              <button
                type="button"
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sable-50 ${
                  idx === activeIndex ? "bg-sable-50" : ""
                }`}
              >
                <MapPin size={14} className="shrink-0 text-zellige-600" />
                <span className="truncate">{s.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-1 text-xs text-slate-400">
        Suggestions locales • saisie libre possible
      </p>
    </div>
  );
}
