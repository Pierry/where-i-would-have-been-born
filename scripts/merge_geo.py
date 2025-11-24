#!/usr/bin/env python3
"""Merge population data, GeoNames metadata, and REST Countries payload."""
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Dict, List, Tuple
FLAG_BASE = 127397


def read_population(csv_path: Path) -> List[Dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [row for row in reader if row.get("population")]


def read_geonames(path: Path) -> Dict[str, Dict[str, str]]:
    records: Dict[str, Dict[str, str]] = {}
    header: List[str] = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            if line.startswith("#"):
                header = line[1:].strip().split("\t")
                continue
            if not line.strip():
                continue
            values = line.strip().split("\t")
            row = {header[i]: values[i] for i in range(min(len(header), len(values)))}
            iso3 = row.get("ISO3")
            if iso3:
                records[iso3.upper()] = row
    return records


def read_rest_countries(path: Path) -> Dict[str, Dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    mapping: Dict[str, Dict] = {}
    for entry in payload:
        iso3 = entry.get("cca3")
        if iso3:
            mapping[iso3.upper()] = entry
    return mapping


def _flag_emoji(iso2: str | None) -> str | None:
    if not iso2 or len(iso2) != 2:
        return None
    upper = iso2.upper()
    return "".join(chr(FLAG_BASE + ord(char)) for char in upper)


def iso_from_population(row: Dict[str, str], geonames: Dict[str, Dict[str, str]]) -> Tuple[str | None, str]:
    iso3 = (row.get("iso3") or "").upper()
    location = row.get("location", "")
    if iso3:
        return iso3, location
    for record in geonames.values():
        if record.get("Country", "").lower() == location.lower():
            return record.get("ISO3"), location
    return None, location


def build_country_entry(
    row: Dict[str, str],
    iso3: str,
    geonames: Dict[str, Dict[str, str]],
    rest_entry: Dict,
    total_population: int,
    cumulative: float,
) -> Tuple[Dict, float]:
    population = int(row["population"])
    weight = population / total_population
    cumulative += weight
    geo = geonames.get(iso3, {})
    capitals = rest_entry.get("capital") or []
    capital = geo.get("Capital") or (capitals[0] if capitals else None)
    capital_info = rest_entry.get("capitalInfo") or {}
    capital_coords = capital_info.get("latlng") or []
    latlng = rest_entry.get("latlng") or capital_coords
    flag_asset = rest_entry.get("flags", {}).get("svg")
    map_url = rest_entry.get("maps", {}).get("googleMaps")
    region = rest_entry.get("region") or geo.get("Continent")
    subregion = rest_entry.get("subregion") or geo.get("Subregion")
    iso2 = rest_entry.get("cca2")
    return (
        {
            "iso3": iso3,
            "iso2": iso2,
            "country": row.get("location", ""),
            "population": population,
            "weight": round(weight, 8),
            "cumulativeWeight": round(cumulative, 8),
            "capital": capital,
            "capitalLatLng": capital_coords,
            "latLng": latlng,
            "flag": flag_asset,
            "flagEmoji": rest_entry.get("flag") or _flag_emoji(iso2),
            "mapUrl": map_url,
            "region": region,
            "subregion": subregion,
            "spotlightCity": capitals[0] if capitals else None,
        },
        cumulative,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--population-csv", default="data/raw/un_population_2023.csv")
    parser.add_argument("--geonames", default="data/raw/countryInfo.txt")
    parser.add_argument("--rest-json", default="data/raw/rest-countries.json")
    parser.add_argument("--output", default="data/processed/country_stats.json")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    population = read_population(Path(args.population_csv))
    geonames = read_geonames(Path(args.geonames))
    rest = read_rest_countries(Path(args.rest_json))
    total = sum(int(row["population"]) for row in population)
    cumulative = 0.0
    enriched: List[Dict] = []
    for row in population:
        iso3, _ = iso_from_population(row, geonames)
        if not iso3:
            continue
        rest_entry = rest.get(iso3)
        if not rest_entry:
            continue
        entry, cumulative = build_country_entry(row, iso3, geonames, rest_entry, total, cumulative)
        enriched.append(entry)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(enriched, indent=2), encoding="utf-8")
    print(f"Wrote {len(enriched)} country records to {output_path}")


if __name__ == "__main__":
    main()
