.PHONY: install dev build lint test test-e2e format refresh-data

INSECURE_SSL ?=
SSL_FLAG=$(if $(filter 1 true yes,$(INSECURE_SSL)),--insecure,)

install:
	cd web && npm install

dev:
	cd web && npm run dev

build:
	cd web && npm run build

lint:
	cd web && npm run lint

test:
	cd web && npm run test

test-e2e:
	cd web && npm run test:e2e

format:
	cd web && npx prettier --write src

refresh-data:
	python3 scripts/fetch_population.py --normalized-output data/raw/un_population_2023.csv $(SSL_FLAG)
	python3 scripts/fetch_geonames.py --output data/raw/countryInfo.txt $(SSL_FLAG)
	python3 scripts/fetch_flags.py --output data/raw/rest-countries.json $(SSL_FLAG)
	python3 scripts/merge_geo.py --population-csv data/raw/un_population_2023.csv --output data/processed/country_stats.json
	cp data/processed/country_stats.json web/public/data/country-stats.json
