import { describe, it, expect } from 'vitest'
import { createSessionToken, verifySessionToken } from './session'

const SECRET = 'test-secret'

describe('session tokens', () => {
  it('verifies a freshly created token', () => {
    const token = createSessionToken(SECRET, 1_000_000)
    expect(verifySessionToken(token, SECRET, 1_000_000)).toBe(true)
  })

  it('rejects an expired token', () => {
    const token = createSessionToken(SECRET, 1_000_000, 1000)
    expect(verifySessionToken(token, SECRET, 1_002_000)).toBe(false)
  })

  it('rejects a token signed with a different secret', () => {
    const token = createSessionToken('other-secret', 1_000_000)
    expect(verifySessionToken(token, SECRET, 1_000_000)).toBe(false)
  })

  it('rejects a token whose expiry was tampered with', () => {
    const token = createSessionToken(SECRET, 1_000_000, 1000)
    const [, mac] = token.split('.')
    expect(verifySessionToken(`9999999999999.${mac}`, SECRET, 1_000_000)).toBe(false)
  })

  it('rejects malformed and empty tokens', () => {
    expect(verifySessionToken('', SECRET)).toBe(false)
    expect(verifySessionToken('garbage', SECRET)).toBe(false)
    expect(verifySessionToken('123.abc', '')).toBe(false)
  })

  it('rejects a valid token with trailing segments appended', () => {
    const token = createSessionToken(SECRET, 1_000_000)
    expect(verifySessionToken(`${token}.junk`, SECRET, 1_000_000)).toBe(false)
  })
})
