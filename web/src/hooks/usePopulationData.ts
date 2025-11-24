import { useEffect, useMemo, useState } from 'react'
import type { CountryStat } from '../types'

const DATA_URL = '/data/country-stats.json'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export function usePopulationData() {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CountryStat[]>([])

  useEffect(() => {
    let cancelled = false
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load population data (${response.status})`)
        }
        return response.json()
      })
      .then((payload: CountryStat[]) => {
        if (cancelled) {
          return
        }
        setData(payload)
        setStatus('ready')
      })
      .catch((err: Error) => {
        if (cancelled) {
          return
        }
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalPopulation = useMemo(
    () => data.reduce((sum, record) => sum + (record.population ?? 0), 0),
    [data],
  )

  return { data, status, error, totalPopulation }
}
