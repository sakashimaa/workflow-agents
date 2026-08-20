import { describe, expect, it } from 'vitest'
import { validateRequestTransition } from '../../shared/domain/request-transitions'

const base = { role: 'operator' as const, hasAssignee: true, isAssignedAgent: false }

describe('request status transitions', () => {
  it('allows the happy path when required data exists', () => {
    expect(validateRequestTransition({ ...base, from: 'new', to: 'assigned' }).valid).toBe(true)
    expect(validateRequestTransition({ ...base, from: 'assigned', to: 'in_progress' }).valid).toBe(true)
    expect(validateRequestTransition({ ...base, from: 'in_progress', to: 'resolved', resolution: 'Исправлена конфигурация' }).valid).toBe(true)
    expect(validateRequestTransition({ ...base, from: 'resolved', to: 'closed', reason: 'Клиент подтвердил' }).valid).toBe(true)
  })

  it('rejects direct closing of a new request', () => {
    expect(validateRequestTransition({ ...base, from: 'new', to: 'closed', reason: 'Нет' })).toMatchObject({ valid: false, code: 'INVALID_TRANSITION' })
  })

  it('requires an assignee before assigning', () => {
    expect(validateRequestTransition({ ...base, hasAssignee: false, from: 'new', to: 'assigned' })).toMatchObject({ valid: false, code: 'ASSIGNEE_REQUIRED' })
  })

  it('requires a reason for waiting and escalation', () => {
    expect(validateRequestTransition({ ...base, from: 'in_progress', to: 'waiting' })).toMatchObject({ valid: false, code: 'REASON_REQUIRED' })
    expect(validateRequestTransition({ ...base, from: 'in_progress', to: 'escalated' })).toMatchObject({ valid: false, code: 'REASON_REQUIRED' })
  })

  it('requires a resolution before resolving', () => {
    expect(validateRequestTransition({ ...base, from: 'in_progress', to: 'resolved' })).toMatchObject({ valid: false, code: 'RESOLUTION_REQUIRED' })
  })

  it('limits a client to confirming a resolved request', () => {
    expect(validateRequestTransition({ ...base, role: 'client', from: 'assigned', to: 'in_progress' })).toMatchObject({ valid: false, code: 'FORBIDDEN' })
    expect(validateRequestTransition({ ...base, role: 'client', from: 'resolved', to: 'closed' }).valid).toBe(true)
  })

  it('limits an agent to their assigned request', () => {
    expect(validateRequestTransition({ ...base, role: 'agent', from: 'assigned', to: 'in_progress' })).toMatchObject({ valid: false, code: 'FORBIDDEN' })
    expect(validateRequestTransition({ ...base, role: 'agent', isAssignedAgent: true, from: 'assigned', to: 'in_progress' }).valid).toBe(true)
  })
})
