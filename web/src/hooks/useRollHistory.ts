import { useEffect, useState } from 'react'
import type { RollRecord } from '../types'

const DEFAULT_STORAGE_KEY = 'where-born-rolls'
const HISTORY_LIMIT = 50

function loadFromStorage(key: string): RollRecord[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as RollRecord[]) : []
  } catch (error) {
    console.warn('Unable to parse saved history', error)
    return []
  }
}

export function useRollHistory(storageKey = DEFAULT_STORAGE_KEY) {
  const [history, setHistory] = useState<RollRecord[]>(() => loadFromStorage(storageKey))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(storageKey, JSON.stringify(history))
  }, [history, storageKey])

  const addEntry = (entry: RollRecord) => {
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT))
  }

  const clearHistory = () => setHistory([])

  return { history, addEntry, clearHistory }
}
