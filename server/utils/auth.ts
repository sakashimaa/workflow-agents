import type { H3Event } from 'h3'
import type { AuthUser, UserRole } from '#shared/types/domain'
import { readSessionCookie, resolveUserSession } from '../services/session'

export async function getCurrentUser(event: H3Event): Promise<AuthUser | null> {
  return resolveUserSession(readSessionCookie(event))
}

export async function requireUser(event: H3Event, roles?: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Требуется авторизация' })
  if (roles && !roles.includes(user.role)) throw createError({ statusCode: 403, statusMessage: 'Недостаточно прав для операции' })
  return user
}
