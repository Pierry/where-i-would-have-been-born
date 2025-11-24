#!/usr/bin/env python3
"""Download and normalize UN World Population data for a target year."""
from __future__ import annotations

import argparse
import csv
import io
import sys
import urllib.request
import zipfile
from pathlib import Path
import ssl
from typing import Dict, Iterable, Iterator, List, Optional

DEFAULT_SOURCE = "https://raw.githubusercontent.com/datasets/population/master/data/population.csv"


def _build_ssl_context(insecure: bool) -> ssl.SSLContext:
    context = ssl.create_default_context()
    if insecure:
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
    return context


def download(url: str, destination: Path, insecure: bool) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    sys.stdout.write(f"Downloading population data from {url}\n")
    context = _build_ssl_context(insecure)
    with urllib.request.urlopen(url, context=context) as response:
        destination.write_bytes(response.read())
    return destination


def _iter_csv_rows(path: Path, csv_name: Optional[str]) -> Iterator[Dict[str, str]]:
    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as archive:
            target = csv_name or next(
                (name for name in archive.namelist() if name.lower().endswith(".csv")),
                None,
            )
            if not target:
                raise RuntimeError("Zip archive did not contain a CSV file")
            with archive.open(target) as handle:
                reader = csv.DictReader(io.TextIOWrapper(handle, encoding="utf-8-sig"))
                for row in reader:
                    yield row
    else:
        with path.open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            yield from reader


def normalize_population(
    rows: Iterable[Dict[str, str]],
    year: int,
    variant: str,
    sex: str,
    value_scale: float,
) -> List[Dict[str, str]]:
    normalized: List[Dict[str, str]] = []
    variant_lower = variant.lower()
    sex_lower = sex.lower()
    for row in rows:
        # UN WPP format (with variant, sex, time columns)
        if row.get("Time"):
            if row.get("Variant") and row["Variant"].strip().lower() != variant_lower:
                continue
            if row.get("Sex") and row["Sex"].strip().lower() != sex_lower:
                continue
            if int(float(row["Time"])) != year:
                continue
            population_value: Optional[str] = None
            for key in ("PopTotal", "Pop1Jan", "Pop1Jul", "Value"):
                value = row.get(key)
                if value and value.strip():
                    population_value = value
                    break
            if not population_value:
                continue
            iso3 = row.get("ISO3 Alpha-code") or row.get("ISO3", "")
            location = row.get("Location", "")
        # World Bank / datasets population CSV (no variant/sex columns)
        elif row.get("Year"):
            if int(float(row["Year"])) != year:
                continue
            population_value = row.get("Value") or row.get("population")
            if not population_value:
                continue
            iso3 = row.get("Country Code", "")
            location = row.get("Country Name", "")
        else:
            continue
        try:
            population = int(round(float(population_value) * value_scale))
        except ValueError:
            continue
        if population <= 0:
            continue
        normalized.append(
            {
                "location": location.strip(),
                "iso3": iso3.strip(),
                "loc_id": row.get("LocID", "").strip(),
                "population": str(population),
            }
        )
    return normalized


def write_csv(rows: List[Dict[str, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["loc_id", "iso3", "location", "population"]
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", default=DEFAULT_SOURCE, help="UN WPP download URL")
    parser.add_argument(
        "--download-to",
        default="data/raw/population_source.csv",
        help="Where to store the raw download",
    )
    parser.add_argument(
        "--csv-name",
        default="WPP2022_TotalPopulationBySex.csv",
        help="Name of the CSV inside the archive",
    )
    parser.add_argument("--year", type=int, default=2023)
    parser.add_argument("--variant", default="Medium")
    parser.add_argument("--sex", default="Both sexes")
    parser.add_argument(
        "--value-scale",
        type=int,
        default=1,
        help="Multiply the population value by this factor (UN data ships values in thousands)",
    )
    parser.add_argument(
        "--normalized-output",
        default="data/raw/un_population_2023.csv",
        help="Where to write the filtered CSV",
    )
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Skip TLS certificate verification (useful behind intercepting proxies)",
    )
    return parser


def main() -> None:
    parser = build_argument_parser()
    args = parser.parse_args()
    download_path = Path(args.download_to)
    if args.source_url.startswith("http"):
        download(args.source_url, download_path, insecure=args.insecure)
    else:
        download_path = Path(args.source_url)
    rows = list(_iter_csv_rows(download_path, args.csv_name))
    normalized = normalize_population(rows, args.year, args.variant, args.sex, args.value_scale)
    write_csv(normalized, Path(args.normalized_output))
    sys.stdout.write(f"Wrote {len(normalized)} normalized rows\n")


if __name__ == "__main__":
    main()
