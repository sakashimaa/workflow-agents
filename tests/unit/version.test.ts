import { describe, expect, it } from 'vitest'
import { hasVersionConflict } from '../../shared/domain/version'

describe('optimistic concurrency', () => {
  it('accepts an omitted or current version', () => {
    expect(hasVersionConflict(4)).toBe(false)
    expect(hasVersionConflict(4, 4)).toBe(false)
  })

  it('rejects a stale write', () => {
    expect(hasVersionConflict(5, 4)).toBe(true)
  })
})
