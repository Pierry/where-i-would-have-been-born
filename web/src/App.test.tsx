import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { CountryStat } from './types'

const sampleCountries: CountryStat[] = [
  {
    iso3: 'AAA',
    iso2: 'AA',
    country: 'Alpha',
    population: 100,
    weight: 0.5,
    cumulativeWeight: 0.5,
    capital: 'Metro',
    flagEmoji: '🏳️',
  },
  {
    iso3: 'BBB',
    iso2: 'BB',
    country: 'Beta',
    population: 100,
    weight: 0.5,
    cumulativeWeight: 1,
    capital: 'City',
    flagEmoji: '🏴',
  },
]

const mockPopulationHook = vi.fn()
const mockHistoryHook = vi.fn()

vi.mock('./hooks/usePopulationData', () => ({
  usePopulationData: () => mockPopulationHook(),
}))

vi.mock('./hooks/useRollHistory', () => ({
  useRollHistory: () => mockHistoryHook(),
}))

beforeEach(() => {
  mockPopulationHook.mockReturnValue({
    data: sampleCountries,
    status: 'ready',
    error: null,
    totalPopulation: 200,
  })
  mockHistoryHook.mockReturnValue({
    history: [],
    addEntry: vi.fn(),
    clearHistory: vi.fn(),
  })
})

describe('App', () => {
  it('renders hero copy and disabled roll button by default', () => {
    render(<App />)
    expect(screen.getByText(/Where would you have been born/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roll the dice/i })).toBeDisabled()
  })

  it('enables the roll button after entering a name', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText(/Full name/i)
    await user.type(input, 'Grace Hopper')
    expect(screen.getByRole('button', { name: /roll the dice/i })).toBeEnabled()
  })
})
