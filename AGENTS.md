# Repository Guidelines

## Project Structure & Module Organization
This repository is intentionally bare so contributors can shape it around a consistent layout. Place production code in `src/` (e.g., `src/domain/`, `src/pipelines/`, `src/cli.py` for entry points), datasets under `data/` with `data/raw/` and `data/processed/`, reusable notebooks under `notebooks/`, and automated tests in `tests/`. Store shared configs in `configs/` (YAML) and document decisions in `docs/ADR-*.md`. Keep generated artifacts (plots, cache files) out of version control by updating `.gitignore`.

## Build, Test, and Development Commands
Work inside a virtual environment so dependencies stay reproducible:
- `python3 -m venv .venv && source .venv/bin/activate` creates and loads a local env.
- `pip install -r requirements.txt` installs runtime and dev dependencies once the file exists.
- `python -m where_i_would_have_been_born.cli --profile example` should become the canonical way to run the simulator once `src/` is populated.
Use a lightweight `Makefile` (see `make format`, `make lint`, `make test`) to wrap these commands; add new targets instead of inventing bespoke scripts.

## Coding Style & Naming Conventions
Target Python 3.11+, four-space indentation, Black-compatible line width (88 chars), and snake_case for modules, functions, and filenames. Classes use CapWords, constants are UPPER_SNAKE_CASE, and configuration keys stay kebab-case to mirror CLI flags. Run formatters and linters before every push: `ruff check src tests` for linting and `black src tests` for formatting. Type-hint public APIs and gate new modules behind `mypy --strict`.

## Testing Guidelines
Add a `tests/` mirror of the `src/` tree: e.g., `tests/pipelines/test_birthplace.py`. Default to pytest, parametrize edge cases, and keep fixtures in `tests/conftest.py`. Aim for >=90% statement coverage by running `pytest --maxfail=1 --cov=src --cov-report=term-missing`. Use descriptive names like `test_calculate_birth_place_handles_equator()` to spell out behavior.

## Commit & Pull Request Guidelines
Because no history exists yet, establish a clean baseline using Conventional Commits (`feat: add birthplace scorer`). Keep commits scoped to one concern and include context in the body when touching models or data definitions. Pull requests should describe motivation, list testing evidence (`pytest`, lint output), link tracking issues, and attach screenshots or sample JSON for user-visible changes. Tag reviewers who own the touched modules.

## Security & Configuration Tips
Never commit personal data or location coordinates derived from external sources; store raw exports in `data/private/` and add that path to `.gitignore`. Keep API keys and map tokens in `.env` files loaded via `python-dotenv`, and document required variables in `docs/configuration.md`. Rotate credentials after demos and clean notebooks before pushing by clearing execution counts.
