import { describe, expect, it } from 'vitest'
import { generateRandomValue, pickCountryByWeight } from './random'
import type { CountryStat } from '../types'

const mockCountries: CountryStat[] = [
  { iso3: 'AAA', country: 'Alpha', population: 100, weight: 0.25, cumulativeWeight: 0.25 },
  { iso3: 'BBB', country: 'Beta', population: 200, weight: 0.5, cumulativeWeight: 0.75 },
  { iso3: 'CCC', country: 'Gamma', population: 300, weight: 0.25, cumulativeWeight: 1 },
]

describe('generateRandomValue', () => {
  it('produces deterministic values per input and timestamp', () => {
    const timestamp = 1_696_969_696
    const first = generateRandomValue('Ada Lovelace', timestamp)
    const second = generateRandomValue('Ada Lovelace', timestamp)
    expect(first).toBe(second)
  })
})

describe('pickCountryByWeight', () => {
  it('selects entries based on weights', () => {
    const first = pickCountryByWeight(mockCountries, 0.2)
    expect(first?.iso3).toBe('AAA')
    const second = pickCountryByWeight(mockCountries, 0.74)
    expect(second?.iso3).toBe('BBB')
    const third = pickCountryByWeight(mockCountries, 0.99)
    expect(third?.iso3).toBe('CCC')
  })

  it('falls back gracefully when population list is empty', () => {
    expect(pickCountryByWeight([], 0.5)).toBeUndefined()
  })
})
