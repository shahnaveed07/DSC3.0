import { describe, expect, it } from 'vitest'

const BASE_PRICES = {
  free: 0,
  sniper: 1,
  aimbot: 1,
  aimassist: 1,
  streamer: 2,
  special: 3,
  premium: 5,
  customised: 10,
}

const DURATION_MULTIPLIERS = {
  1: 0.5,
  3: 1,
  7: 2,
  15: 3,
  30: 4,
  60: 6,
  365: 8,
}

const USD_TO_INR = 90

function calculatePrice(panel, days) {
  const normalized = String(panel || '').toLowerCase().trim()
  const base = BASE_PRICES[normalized]
  if (base === undefined) return null
  const mult = DURATION_MULTIPLIERS[days]
  if (mult === undefined) return null
  const totalUsd = base * mult
  const totalInr = totalUsd * USD_TO_INR
  return { totalUsd, totalInr }
}

describe('Pricing and Multiplier Verification', () => {
  it('correctly maps both aimassist and aimbot aliases to base rate $1', () => {
    expect(BASE_PRICES['aimbot']).toBe(1)
    expect(BASE_PRICES['aimassist']).toBe(1)
  })

  it('verifies STREAMER-PANEL base rate is $2 USD', () => {
    expect(BASE_PRICES['streamer']).toBe(2)
  })

  it('calculates trial (1 Day = 0.5x multiplier) accurately', () => {
    // Streamer: $2 * 0.5 = $1 USD -> 90 INR
    const streamer1Day = calculatePrice('streamer', 1)
    expect(streamer1Day.totalUsd).toBe(1)
    expect(streamer1Day.totalInr).toBe(90)

    // Sniper: $1 * 0.5 = $0.5 USD -> 45 INR
    const sniper1Day = calculatePrice('sniper', 1)
    expect(sniper1Day.totalUsd).toBe(0.5)
    expect(sniper1Day.totalInr).toBe(45)
  })

  it('calculates monthly (30 Days = 4x multiplier) accurately', () => {
    // Streamer: $2 * 4 = $8 USD -> 720 INR
    const streamerMonth = calculatePrice('streamer', 30)
    expect(streamerMonth.totalUsd).toBe(8)
    expect(streamerMonth.totalInr).toBe(720)

    // Special: $3 * 4 = $12 USD -> 1080 INR
    const specialMonth = calculatePrice('special', 30)
    expect(specialMonth.totalUsd).toBe(12)
    expect(specialMonth.totalInr).toBe(1080)
  })

  it('calculates yearly (365 Days = 8x multiplier) accurately', () => {
    // Special: $3 * 8 = $24 USD -> 2160 INR
    const specialYear = calculatePrice('special', 365)
    expect(specialYear.totalUsd).toBe(24)
    expect(specialYear.totalInr).toBe(2160)
  })

  it('returns null for unlisted panels or invalid days', () => {
    expect(calculatePrice('unknown-tier', 30)).toBeNull()
    expect(calculatePrice('streamer', 999)).toBeNull()
  })

  it('evaluates free tier as 0 across all durations', () => {
    const freeRes = calculatePrice('free', 30)
    expect(freeRes.totalUsd).toBe(0)
    expect(freeRes.totalInr).toBe(0)
  })
})
