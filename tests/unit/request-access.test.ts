import { describe, expect, it } from 'vitest'
import { canReadRequest } from '../../shared/domain/request-access'
import { demoRequests, demoUsers } from '../../shared/fixtures/demo-data'

describe('request visibility', () => {
  const request = demoRequests[0]!

  it('isolates clients by customer', () => {
    expect(canReadRequest(demoUsers[0]!, request)).toBe(true)
    expect(canReadRequest({ ...demoUsers[0]!, customerId: 'customer-atlas' }, request)).toBe(false)
  })

  it('isolates agents by assignment while staff can inspect the queue', () => {
    expect(canReadRequest({ ...demoUsers[2]!, id: request.assigneeId! }, request)).toBe(true)
    expect(canReadRequest(demoUsers[2]!, request)).toBe(false)
    expect(canReadRequest(demoUsers[1]!, request)).toBe(true)
  })
})
