# Where I Would Have Been Born – Product Requirements Document

## 1. Product Summary
Build a playful React web application that estimates a hypothetical birthplace based on global population distribution. Users enter their full name, tap a "Roll the Dice" style CTA, and instantly see which country they would most likely have been born in. The experience should feel modern, flat, and delightful, highlighting the rarity of certain birthplaces. All user attempts are persisted so visitors can explore patterns over time.

## 2. Goals & Non-Goals
- **Goals:** deliver sub-second roll results, visualize the chosen country with contextual stats, make sharing easy, and capture anonymous interaction data for future personalization.
- **Non-Goals:** actual genealogy research, collecting PII beyond submitted names, or precision demographic science (results remain a lighthearted joke backed by public statistics).

## 3. Target Personas & Use Cases
- **Casual explorers** (desktop/mobile) who want a quick curiosity hit.
- **Social sharers** seeking fun facts to post.
Use cases: roll once, compare multiple names, revisit history, screenshot and share, discuss geographic odds.

## 4. Functional Requirements
1. **Name Input & Validation:** responsive form with first+last name field, instant feedback, keyboard shortcuts (Enter to roll).
2. **Dice Roll Interaction:** animated button using Framer Motion; on submit, compute weighted random country via latest UN population data (cached JSON) and display probability.
3. **Result Reveal:** show country flag emoji/SVG, percentile odds, playful copy, and link to learn about the country. Offer "Roll again" and "Share" (Web Share API + copy link).
4. **Attempt Persistence:** store rolls client-side (IndexedDB via idb or localStorage fallback) including timestamp, name hash, country, probability; surface history panel with filters.
5. **Accessibility & i18n:** WCAG AA contrast, focus-visible styles, text alternatives, and architecture ready for future translations.

## 5. UX, Visual & Brand Guidelines
- Layout: single-page card centered on gradient background (#0A2540 to #1B4DFF), content widths 640px max, generous white space.
- Typography: use "Virgil" (Excalidraw aesthetic) for headings with fallback `"Virgil", "Inter", system-ui`; body text in Inter 16px/1.6.
- Components follow design tokens (spacing scale 4px multiples) and CSS variables for colors, radii, and shadows.
- Motion: 200ms ease-in-out transitions; dice roll uses physics-inspired animation.

## 6. Technical Approach
- **Stack:** React 18 + TypeScript + Vite, React Router (for shareable `/roll/:id`), Zustand or Redux Toolkit for state, React Query for data fetching/caching.
- **Data:** pre-process latest world-population CSV into `public/data/population.json` (country, iso3, population, cumulative weight). Use deterministic PRNG seeded by hash(name + timestamp) to make rolls reproducible per entry.
- **Storage & Analytics:** persist history via IndexedDB; capture anonymized events with PostHog (self-host toggle). Implement PWA support for installability.
- **Quality:** ESLint (Airbnb + React hooks), Prettier, TypeScript strict mode, unit tests with Vitest + React Testing Library, E2E with Playwright.

## 7. Population Data Acquisition Plan
- Scripted ingestion outlined in `docs/data-sourcing-plan.md` keeps inputs reproducible. `fetch_population.py` pulls UN WPP 2023 \"Medium variant\" totals, `merge_geo.py` enriches with GeoNames capital + lat/lon, and `fetch_flags.py` snapshots REST Countries flag SVGs.
- Outputs land in `data/raw/` and merge into `data/processed/country_stats.json` featuring ISO3, population, probability weight, sample city, coordinates, bbox, and flag asset path. Include cumulative weights to allow binary-search selection during rolls.
- A `make refresh-data` task re-runs scripts twice yearly; CI test guards validate population sums and ensure every record exposes required metadata before publishing to `public/data/population.json`.

## 8. Success Metrics
- D1 retention (10%+ returning users), average rolls per session ≥3, share CTA click-through ≥15%, error rate <0.5%, Lighthouse performance ≥90.

## 9. Release Plan
- **Sprint 1:** scaffolding, dataset ingestion, core roll algorithm.
- **Sprint 2:** UI polish, persistence layer, analytics wiring.
- **Sprint 3:** QA, accessibility audit, marketing landing copy, production deploy via Vercel.
