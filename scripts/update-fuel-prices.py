#!/usr/bin/env python3
"""
Met à jour lib/data/fuelPrices.json depuis le Weekly Oil Bulletin officiel de
la Commission européenne (prix moyens nationaux à la pompe, taxes comprises).

    pip install openpyxl
    python3 scripts/update-fuel-prices.py

Le bulletin est hebdomadaire ; l'application considère les prix périmés
14 jours après la date du bulletin (voir FUEL_PRICE_MAX_AGE_DAYS dans
lib/fuelByCountry.ts) et revient alors au prix saisi par l'utilisateur.
"""
import io
import json
import re
import urllib.request
from datetime import datetime
from pathlib import Path

import openpyxl

PAGE = "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en"
UA = {"User-Agent": "RME-Voyage fuel price updater"}

# Libellés du bulletin → ISO 3166-1 alpha-2.
COUNTRIES = {
    "Austria": "AT", "Belgium": "BE", "Bulgaria": "BG", "Croatia": "HR", "Cyprus": "CY",
    "Czechia": "CZ", "Denmark": "DK", "Estonia": "EE", "Finland": "FI", "France": "FR",
    "Germany": "DE", "Greece": "GR", "Hungary": "HU", "Ireland": "IE", "Italy": "IT",
    "Latvia": "LV", "Lithuania": "LT", "Luxembourg": "LU", "Malta": "MT", "Netherlands": "NL",
    "Poland": "PL", "Portugal": "PT", "Romania": "RO", "Slovakia": "SK", "Slovenia": "SI",
    "Spain": "ES", "Sweden": "SE",
}


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


page = fetch(PAGE).decode("utf-8", "replace")
match = re.search(r'href="([^"]+prices%20with%20Taxes[^"]+\.xlsx)"', page)
if not match:
    raise SystemExit("Lien « prices with taxes » introuvable sur " + PAGE)
xlsx_url = "https://energy.ec.europa.eu" + match.group(1).replace("&amp;", "&")

sheet = openpyxl.load_workbook(io.BytesIO(fetch(xlsx_url)), data_only=True).active
rows = list(sheet.iter_rows(values_only=True))
header, units = rows[0], rows[1]
assert "Euro-super 95" in str(header[1]) and "gas oil" in str(header[2]).lower(), header
assert units[1] == "1000 l" and units[2] == "1000 l", units
bulletin_date = units[0]
assert isinstance(bulletin_date, datetime), units

prices = {}
for row in rows[2:]:
    code = COUNTRIES.get(str(row[0]).strip())
    if not code:
        continue
    entry = {}
    for key, value in (("petrol95", row[1]), ("diesel", row[2])):
        if isinstance(value, (int, float)) and value > 0:
            entry[key] = round(value / 1000, 3)  # EUR / 1000 l → EUR / l
    if entry:
        prices[code] = entry

missing = set(COUNTRIES.values()) - set(prices)
if missing:
    raise SystemExit(f"Pays manquants dans le bulletin : {sorted(missing)}")

out = {
    "source": "Commission européenne — Weekly Oil Bulletin, prix moyens nationaux TTC",
    "sourceUrl": xlsx_url,
    "observedAt": bulletin_date.date().isoformat(),
    "unit": "EUR/L",
    "prices": dict(sorted(prices.items())),
}
path = Path(__file__).resolve().parent.parent / "lib" / "data" / "fuelPrices.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{path.name} : {len(prices)} pays, bulletin du {out['observedAt']}")
