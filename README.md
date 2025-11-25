# Where Would I Have Been Born?

[![Build & Deploy](https://github.com/Pierry/where-i-would-have-been-born/actions/workflows/firebase-hosting-deploy.yml/badge.svg)](https://github.com/Pierry/where-i-would-have-been-born/actions/workflows/firebase-hosting-deploy.yml)
[![Firebase Hosting](https://img.shields.io/badge/Hosted%20on-Firebase-FFCA28?logo=firebase&logoColor=white)](https://where-i-would-have-been-born.web.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A playful web application that estimates your hypothetical birthplace based on global population distribution. Enter your name, roll the dice, and discover which country you would most likely have been born in!

**[Try it live](https://where-i-would-have-been-born.web.app/)**

---

## Features

- **Population-Weighted Randomness**: Results weighted by real-world UN population data
- **Deterministic Rolls**: Same name + timestamp produces reproducible results via seeded PRNG
- **Local History**: Attempts persisted in localStorage for pattern exploration
- **Rich Country Data**: Displays flag, capital, spotlight city, coordinates, and map links
- **Responsive Design**: Mobile-first layout with modern, flat aesthetic
- **Accessibility Ready**: WCAG AA compliant with proper focus management

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Testing** | Vitest + React Testing Library |
| **E2E Testing** | Playwright |
| **Linting** | ESLint 9 + TypeScript rules |
| **Formatting** | Prettier |
| **CI/CD** | GitHub Actions |
| **Hosting** | Firebase Hosting |

---

## Architecture

```
├── AGENTS.md                    # Contributor guide
├── docs/
│   ├── PRD.md                   # Product requirements
│   ├── data-sourcing-plan.md    # Data ingestion workflow
│   └── data-dictionary.md       # Schema documentation
├── scripts/                     # Data ingestion helpers (Python)
├── data/                        # Raw + processed intermediate files
├── web/
│   ├── src/
│   │   ├── App.tsx              # Main application component
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── hooks/
│   │   │   ├── usePopulationData.ts   # Fetches country statistics
│   │   │   └── useRollHistory.ts      # localStorage persistence
│   │   └── lib/
│   │       └── random.ts        # Deterministic PRNG + weighted selection
│   ├── public/data/
│   │   └── country-stats.json   # Pre-processed population dataset
│   └── tests/                   # Playwright E2E tests
└── Makefile                     # Common developer tasks
```

### Key Design Decisions

1. **Seeded Randomness**: Hash function generates deterministic random values from name + timestamp, ensuring reproducible results

2. **Cumulative Weight Selection**: Countries pre-sorted with cumulative weights for O(n) selection based on population proportion

3. **Client-Side Persistence**: Roll history stored in localStorage (50-entry limit), no server dependencies

4. **Static Data Pipeline**: UN population data pre-processed into static JSON, enabling fast lookups without API calls

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+ (for data refresh scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/Pierry/where-i-would-have-been-born.git
cd where-i-would-have-been-born

# Install dependencies
make install

# Start development server
make dev
```

The app will be available at `http://localhost:5173`

### Available Commands

| Command | Description |
|---------|-------------|
| `make install` | Install npm dependencies |
| `make dev` | Start Vite dev server |
| `make build` | Type-check + production build |
| `make lint` | Run ESLint |
| `make test` | Run Vitest unit tests |
| `make test-e2e` | Run Playwright E2E tests |
| `make format` | Run Prettier formatting |
| `make refresh-data` | Re-download and regenerate country stats |

---

## Testing

### Unit Tests

```bash
# Run all tests
make test

# Run with coverage (inside web/)
cd web && npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run E2E tests
make test-e2e
```

---

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Pipeline Steps

1. **Checkout** - Clone repository
2. **Setup Node.js** - Configure Node 20 with npm caching
3. **Install Dependencies** - `npm ci` for reproducible installs
4. **Lint** - ESLint validation
5. **Test** - Vitest unit test suite
6. **Build** - TypeScript compilation + Vite production build
7. **Deploy** - Firebase Hosting deployment

### Deployment Strategy

| Event | Action |
|-------|--------|
| Pull Request | Deploy preview URL (expires in 7 days) |
| Push to `main` | Deploy to production |

### Manual Deployment

```bash
cd web && npm run build
firebase deploy --only hosting
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes
4. Run tests: `make test && make lint`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push and open a Pull Request

### Commit Convention

| Prefix | Description |
|--------|-------------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | Code style changes |
| `refactor:` | Code refactoring |
| `test:` | Adding/updating tests |
| `chore:` | Maintenance tasks |

### Code Quality

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- All tests must pass before merge
- PR reviews required for `main` branch

### Pull Request Guidelines

- Clear description of changes
- Reference related issues
- All CI checks passing
- Screenshots for UI changes

---

## Data Sources

- [UN World Population Prospects 2023](https://population.un.org/wpp/) - Population statistics
- [REST Countries API](https://restcountries.com/) - Country metadata and flags
- [GeoNames](https://www.geonames.org/) - Geographic coordinates

Run `make refresh-data` to update the dataset. Use `INSECURE_SSL=1 make refresh-data` behind TLS-intercepting proxies.

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/PRD.md`](docs/PRD.md) | Product requirements and release plan |
| [`docs/data-sourcing-plan.md`](docs/data-sourcing-plan.md) | Data ingestion workflow |
| [`docs/data-dictionary.md`](docs/data-dictionary.md) | Schema served to client |
| [`AGENTS.md`](AGENTS.md) | Contributor guidelines |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- UN Population Division for demographic data
- React and Vite communities for excellent tooling
- Firebase for hosting infrastructure
