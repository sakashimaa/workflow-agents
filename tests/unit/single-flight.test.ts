import { describe, expect, it } from 'vitest'
import { useSingleFlight } from '../../app/composables/useSingleFlight'

describe('single-flight operations', () => {
  it('shares one in-flight promise for rapid repeated submissions', async () => {
    let calls = 0
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const operation = useSingleFlight(async () => { calls += 1; await gate; return 'done' })
    const first = operation.run()
    const second = operation.run()
    expect(operation.pending.value).toBe(true)
    expect(first).toBe(second)
    expect(calls).toBe(1)
    release()
    await first
    expect(operation.pending.value).toBe(false)
  })
})
