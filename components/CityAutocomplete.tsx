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
  /** « journey » : grande ville sur fond sombre, sans cadre (carte de trajet de l'accueil). */
  variant?: "form" | "journey";
  /** Alignement du nom en mode « journey » (la destination se lit à droite). */
  align?: "left" | "right";
};

export default function CityAutocomplete({
  label,
  value,
  placeholder,
  onChange,
  onSelect,
  icon,
  maxLength = 120,
  variant = "form",
  align = "left",
}: Props) {
  const journey = variant === "journey";
  const [focused, setFocused] = useState(false);
  // En mode « journey », hors saisie : la ville en grand, le pays en petit
  // dessous (« Paris » / « France »). Le champ garde la valeur complète.
  const [placeName, ...rest] = value.split(",");
  const placeCountry = rest.join(",").trim();
  const showDisplay = journey && !focused && value.trim() !== "";
  const right = align === "right";
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
      <label className="block text-sm font-medium">
        <span className={journey ? `block text-[11px] font-bold uppercase tracking-[.16em] text-white/50 ${right ? "text-right" : ""}` : "flex items-center gap-1 text-xs text-slate-500"}>
          {journey ? label : <>{icon ?? <MapPin size={12} />} {label}</>}
        </span>
        <div className={journey ? "relative" : "relative mt-1"}>
          <input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className={
              journey
                ? `h-[60px] w-full rounded-xl bg-transparent px-1 text-lg font-bold caret-[#f59e0b] placeholder:text-white/40 focus:bg-white/10 focus:px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] ${right ? "text-right focus:text-left" : ""} ${showDisplay ? "text-transparent" : "text-white"}`
                : "w-full rounded-xl border p-3 pr-8 min-h-[44px]"
            }
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
          {showDisplay && (
            <span aria-hidden="true" className={`pointer-events-none absolute inset-0 flex flex-col justify-center px-1 ${right ? "items-end text-right" : ""}`}>
              <span className="max-w-full truncate text-[1.65rem] font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{placeName.trim()}</span>
              {placeCountry && <span className="max-w-full truncate text-xs font-semibold text-white/55">{placeCountry}</span>}
            </span>
          )}
        </div>
      </label>

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className={`absolute z-30 mt-1 text-slate-900 max-h-56 ${journey ? `w-[min(20rem,80vw)] ${right ? "right-0" : "left-0"}` : "w-full"} overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg`}
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

      {!journey && (
        <p className="mt-1 text-xs text-slate-400">
          Suggestions locales • saisie libre possible
        </p>
      )}
    </div>
  );
}
