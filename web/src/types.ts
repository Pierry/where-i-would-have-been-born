export interface CountryStat {
  iso2?: string
  iso3: string
  country: string
  population: number
  weight: number
  cumulativeWeight: number
  capital?: string
  capitalLatLng?: [number, number]
  latLng?: [number, number]
  bbox?: [number, number, number, number]
  flag?: string
  flagEmoji?: string
  mapUrl?: string
  region?: string
  subregion?: string
  spotlightCity?: string
}

export interface RollRecord {
  id: string
  fullName: string
  country: string
  iso3: string
  probability: number
  rolledAt: number
  seed: string
  capital?: string
  city?: string
  flag?: string
  flagEmoji?: string
  mapUrl?: string
}
