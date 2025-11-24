import type { CountryStat } from '../types'

export function hashSeed(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return hash >>> 0
}

export function generateRandomValue(fullName: string, timestamp: number): number {
  const normalizedName = fullName.trim().toLowerCase()
  const mix = `${normalizedName}|${timestamp}`
  const hashed = hashSeed(mix)
  return hashed / 2 ** 32
}

export function pickCountryByWeight(
  population: CountryStat[],
  randomValue: number,
): CountryStat | undefined {
  if (!population.length) {
    return undefined
  }
  const clamped = Math.max(0, Math.min(randomValue, 0.999999))
  return population.find((country) => clamped <= (country.cumulativeWeight ?? 0)) ??
    population[population.length - 1]
}
