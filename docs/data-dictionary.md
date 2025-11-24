# Country Stats Data Dictionary

The front-end reads `public/data/country-stats.json`, which is generated via `make refresh-data`. Each object in the array contains:

| Field | Type | Description |
| --- | --- | --- |
| `iso2` | string | Two-letter ISO3166 code used for emoji flags. Optional when a country lacks ISO2 mapping. |
| `iso3` | string | Three-letter ISO3166 code. Primary identifier for joins and history records. |
| `country` | string | Official English short name. Displayed in the UI. |
| `population` | number | Total inhabitants for the selected year (integer). |
| `weight` | number | Probability share (`population / global_total`). Used to calculate odds. |
| `cumulativeWeight` | number | Sum of `weight` up to this record. Enables binary-search sampling. |
| `capital` | string | Seat of government. |
| `capitalLatLng` | `[number, number]` | Latitude/longitude for the capital, degrees in WGS84. |
| `latLng` | `[number, number]` | Representative centroid for the country; fallback to capital coordinates. |
| `bbox` | `[number, number, number, number]` | Optional bounding box `[minLng, minLat, maxLng, maxLat]` for map contexts. |
| `flag` | string | Relative path or absolute URL to an SVG flag asset. |
| `flagEmoji` | string | Regional-indicator emoji derived from `iso2`; used as lightweight fallback. |
| `mapUrl` | string | Human-friendly map link (e.g., Google Maps). |
| `region` / `subregion` | string | Continent metadata used for filtering. |
| `spotlightCity` | string | Largest city (or fun fact city) displayed in the roll result.

After merging, copy the processed file to `web/public/data/country-stats.json` so Vite can serve it statically.
