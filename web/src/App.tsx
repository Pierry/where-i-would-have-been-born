import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { usePopulationData } from './hooks/usePopulationData'
import { useRollHistory } from './hooks/useRollHistory'
import { generateRandomValue, pickCountryByWeight } from './lib/random'
import type { CountryStat, RollRecord } from './types'

const ROLL_DURATION_MS = 2000
const SAMPLE_INTERVAL_MS = 180

function App() {
  const [fullName, setFullName] = useState('')
  const [latestRoll, setLatestRoll] = useState<RollRecord | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [rollingSample, setRollingSample] = useState<CountryStat | null>(null)
  const animationRef = useRef<number | null>(null)
  const tickerRef = useRef<number | null>(null)
  const { data, status, error, totalPopulation } = usePopulationData()
  const { history, addEntry, clearHistory } = useRollHistory()
  const selectedCountry = useMemo(
    () => (latestRoll ? data.find((country) => country.iso3 === latestRoll.iso3) : undefined),
    [data, latestRoll],
  )

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.clearTimeout(animationRef.current)
      }
      if (tickerRef.current) {
        window.clearInterval(tickerRef.current)
      }
    }
  }, [])

  const startTicker = () => {
    if (!data.length) {
      return
    }
    setRollingSample(() => data[Math.floor(Math.random() * data.length)])
    tickerRef.current = window.setInterval(() => {
      setRollingSample(data[Math.floor(Math.random() * data.length)])
    }, SAMPLE_INTERVAL_MS)
  }

  const stopTicker = () => {
    if (tickerRef.current) {
      window.clearInterval(tickerRef.current)
      tickerRef.current = null
    }
    setRollingSample(null)
  }

  const canRoll = fullName.trim().length > 2 && status === 'ready' && !isRolling

  const handleRoll = (event?: FormEvent) => {
    event?.preventDefault()
    if (!canRoll) {
      return
    }
    if (animationRef.current) {
      window.clearTimeout(animationRef.current)
    }
    setIsRolling(true)
    startTicker()
    animationRef.current = window.setTimeout(() => {
      stopTicker()
      const timestamp = Date.now()
      const randomValue = generateRandomValue(fullName, timestamp)
      const country = pickCountryByWeight(data, randomValue)
      if (!country) {
        setIsRolling(false)
        return
      }
      const roll: RollRecord = {
        id: `${timestamp}-${country.iso3}`,
        fullName: fullName.trim(),
        country: country.country,
        iso3: country.iso3,
        probability: country.weight,
        rolledAt: timestamp,
        seed: `${fullName.trim()}|${timestamp}`,
        capital: country.capital,
        city: country.spotlightCity || country.capital,
        flag: country.flag,
        flagEmoji: country.flagEmoji,
        mapUrl: country.mapUrl,
      }
      setLatestRoll(roll)
      addEntry(roll)
      setFullName('')
      setIsRolling(false)
    }, ROLL_DURATION_MS)
  }

  const handleResetHistory = () => {
    if (history.length === 0) {
      return
    }
    if (window.confirm('Clear all saved rolls?')) {
      clearHistory()
    }
  }

  const globalPopulationLabel = useMemo(() => formatPopulation(totalPopulation), [totalPopulation])

  return (
    <div className="page-shell">
      <main className="experience-card">
        <div className="hero-copy">
          <p className="eyebrow">Population math + playful randomness</p>
          <h1>Where would you have been born?</h1>
          <p>
            Punch in your full name, tap the dice, and we will sample from the world population to
            reveal your hypothetical birthplace. Every try is saved locally so you can compare names
            with friends.
          </p>
        </div>

        <form className="name-form" onSubmit={handleRoll}>
          <label htmlFor="fullName">Full name</label>
          <div className="input-row">
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g., Ada Lovelace"
            />
            <button type="submit" disabled={!canRoll} data-rolling={isRolling}>
              {isRolling ? 'Rolling…' : 'Roll the Dice'}
            </button>
          </div>
          <p className="form-hint">
            Press Enter to roll • dataset covers {data.length} high-population countries (~
            {globalPopulationLabel} people)
          </p>
        </form>

        <section className="result-section">
          {status === 'loading' && <p className="muted">Loading population data…</p>}
          {status === 'error' && <p className="error">Could not load data: {error}</p>}
          {isRolling && <RollingTicker sample={rollingSample} />}
          {!isRolling && latestRoll && selectedCountry ? (
            <ResultCard roll={latestRoll} country={selectedCountry} />
          ) : (
            !isRolling && status === 'ready' && <EmptyState />
          )}
        </section>
      </main>

      <aside className="history-panel">
        <HistoryPanel
          history={history}
          onClear={handleResetHistory}
          datasetCount={data.length}
          totalPopulation={globalPopulationLabel}
        />
      </aside>
    </div>
  )
}

function RollingTicker({ sample }: { sample: CountryStat | null }) {
  return (
    <article className="rolling-card">
      <p className="rolling-label">Shuffling the world…</p>
      <p className="rolling-name">{sample?.country ?? 'Picking a country'}</p>
      <p className="rolling-hint">Hang tight for a couple of seconds.</p>
    </article>
  )
}

function ResultCard({ roll, country }: { roll: RollRecord; country: CountryStat }) {
  const odds = useMemo(() => (roll.probability > 0 ? Math.round(1 / roll.probability) : null), [roll.probability])
  const percentage = (roll.probability * 100).toFixed(2)
  const mapLink = country.mapUrl || `https://www.google.com/maps/search/?api=1&query=${country.country}`
  const coord = country.latLng || country.capitalLatLng
  return (
    <article className="result-card">
      <div className="result-flag">
        {country.flag ? (
          <img src={country.flag} alt={`${country.country} flag`} />
        ) : (
          <span>{roll.flagEmoji ?? country.iso3}</span>
        )}
      </div>
      <div>
        <p className="subtle">You rolled for</p>
        <h2>{roll.fullName}</h2>
        <p className="country-callout">
          You would probably be born in <span>{country.country}</span>
        </p>
        <dl className="result-grid">
          <div>
            <dt>Odds</dt>
            <dd>{percentage}%{odds ? ` • 1 in ${odds.toLocaleString()}` : null}</dd>
          </div>
          <div>
            <dt>Spotlight city</dt>
            <dd>{country.spotlightCity || country.capital}</dd>
          </div>
          <div>
            <dt>Capital</dt>
            <dd>{country.capital}</dd>
          </div>
          <div>
            <dt>Population</dt>
            <dd>{formatPopulation(country.population)}</dd>
          </div>
        </dl>
        {coord && (
          <p className="map-hint">
            Rough location: {coord[0].toFixed(2)}°, {coord[1].toFixed(2)}° •{' '}
            <a href={mapLink} target="_blank" rel="noreferrer">
              explore on a map
            </a>
          </p>
        )}
      </div>
    </article>
  )
}

function HistoryPanel({
  history,
  onClear,
  datasetCount,
  totalPopulation,
}: {
  history: RollRecord[]
  onClear: () => void
  datasetCount: number
  totalPopulation: string
}) {
  return (
    <div className="history-card">
      <div className="history-header">
        <div>
          <p className="eyebrow">Saved rolls</p>
          <h3>{history.length === 0 ? 'No tries yet' : `${history.length} attempt${history.length === 1 ? '' : 's'}`}</h3>
        </div>
        {history.length > 0 && (
          <button className="ghost" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <ul className="history-list">
        {history.map((entry) => (
          <li key={entry.id}>
            <div>
              <p className="history-name">{entry.fullName}</p>
              <p className="history-country">{entry.country}</p>
            </div>
            <div className="history-meta">
              <span>{(entry.probability * 100).toFixed(2)}%</span>
              <time dateTime={new Date(entry.rolledAt).toISOString()}>
                {formatTimestamp(entry.rolledAt)}
              </time>
            </div>
          </li>
        ))}
        {history.length === 0 && <li className="muted">Roll the dice to start a timeline.</li>}
      </ul>
      <div className="dataset-callout">
        <p>
          Currently sampling {datasetCount} high-population countries covering ~{totalPopulation} people. Refresh the
          dataset anytime with <code>make refresh-data</code>.
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <article className="placeholder-card">
      <h2>Ready when you are</h2>
      <p>
        We are standing by with global stats, weighted by population. Enter a full name and click the dice to see
        how hard it is to be born somewhere else.
      </p>
    </article>
  )
}

function formatPopulation(value: number) {
  if (!value) {
    return '0'
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  return value.toLocaleString()
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export default App
