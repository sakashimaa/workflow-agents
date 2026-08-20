import type { AuthUser, ServiceRequest } from '../types/domain'

/** Domain visibility rule shared by HTTP handlers and persistence adapters. */
export function canReadRequest(user: AuthUser, request: ServiceRequest): boolean {
  if (user.role === 'client') return Boolean(user.customerId && request.customerId === user.customerId)
  if (user.role === 'agent') return request.assigneeId === user.id
  return true
}
