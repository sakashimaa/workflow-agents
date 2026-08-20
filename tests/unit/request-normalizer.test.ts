import { describe, expect, it } from 'vitest'
import { normalizeRequest } from '../../app/domain/requests/api'

describe('request API adapter', () => {
  it('normalizes nullable and missing display fields in one place', () => {
    const request = normalizeRequest({ id: 'REQ-1', status: 'new', priority: 'normal', title: '   ', customer: undefined })
    expect(request.title).toBe('Без названия')
    expect(request.customer).toBe('Неизвестный клиент')
    expect(request.assignee).toBeNull()
    expect(request.comments).toEqual([])
    expect(request.version).toBe(1)
  })
})
