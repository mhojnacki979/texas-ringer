import { describe, it, expect } from 'vitest'
import { getEvent, getPodium, listEvents } from './events'

describe('annual event data', () => {
  it('exposes 2025 and 2024 events', () => {
    const years = listEvents().map((e) => e.year)
    expect(years).toContain(2025)
    expect(years).toContain(2024)
  })

  it('derives the podium from the final round (bracket winners, not raw score)', () => {
    const event = getEvent(2025)
    const recurve = event?.divisions.find((d) => d.name === 'Recurve Adult Open')
    expect(recurve).toBeDefined()
    // Trenton Cowles won the championship match despite Ethan Chan's higher score.
    const podium = getPodium(recurve!)
    expect(podium.first).toBe('Trenton Cowles')
    expect(podium.second).toBe('Alex Gilliam')
    expect(podium.third).toBe('Ethan Chan')
  })

  it('returns null for an unknown year', () => {
    expect(getEvent(1999)).toBeNull()
  })
})
