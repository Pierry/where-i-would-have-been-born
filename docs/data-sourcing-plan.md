# Population & Geography Data Sourcing Plan

## Objectives
Provide reliable global data to drive the "roll the dice" probability engine. Each record must include: ISO country codes, official country name, 2023 population, representative major city (capital or largest city), latitude/longitude for map pinning, and a flag asset or URL. Data must be reproducible, scriptable, and stored in-version so the simulation can run offline.

## Primary Data Sources
1. **UN World Population Prospects 2022/2023** – authoritative total population. Download CSV from https://population.un.org/wpp/Download/.
2. **GeoNames Country Info** – provides capital, area, lat/lon. https://download.geonames.org/export/dump/countryInfo.txt
3. **REST Countries API (HTTP/2)** – provides capitals, lat/lon centroids, Google Maps links, and flag SVG URLs. The helper script shells out to `curl` (required for HTTP/2) and stores the snapshot in `data/raw/rest-countries.json`. Set `INSECURE_SSL=1` if your environment performs TLS interception.
4. **Natural Earth Admin 0** – fallback shapes/bbox for map context. https://www.naturalearthdata.com/downloads/110m-cultural-vectors/

## Acquisition Workflow
1. `scripts/fetch_population.py` downloads UN CSV, filters "Medium variant" population for 2023, and outputs `data/raw/un_population_2023.csv`.
2. `scripts/merge_geo.py` joins UN data with GeoNames by ISO3, fetching columns `Country`, `Capital`, `Population`, `ISO3`, `Lat`, `Lon`.
3. `scripts/fetch_flags.py` snapshots REST Countries JSON, extracting `flags.svg` and storing optimized copies under `public/flags/{iso3}.svg`.
4. Combine into `data/processed/country_stats.json` schema:
```json
{
  "iso3": "BRA",
  "country": "Brazil",
  "population": 215313498,
  "weight": 0.0267,
  "capital": "Brasília",
  "capitalLatLng": [-15.793889, -47.882778],
  "flag": "/flags/bra.svg",
  "bbox": [-73.99, -33.77, -34.79, 5.27]
}
```
Include cumulative weight fields for binary search sampling.

## Probability & Storage Strategy
- Precompute `population / global_total` probabilities and cumulative sums to support O(log n) roll selection.
- Store processed JSON in `public/data/population.json` (for app) and `docs/data-dictionary.md` describing fields.
- Persist user rolls locally (`localStorage` or IndexedDB) referencing `iso3` plus resolved metadata.

## Verification & Updates
- Add unit tests validating total population sum ≈ world total and ensuring every displayed record has flag/capital coordinates.
- Schedule semi-annual script run documented via `Makefile` target `make refresh-data`.
- Keep raw downloads in `.gitignore` if huge; otherwise compress with Git LFS if >100MB.
