import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { compare, hash } from 'bcryptjs'
import type { AuthUser, UserRole } from '#shared/types/domain'
import { demoStore } from '../utils/demo-store'
import { getDatabase } from '../database/client'

const COOKIE_NAME = 'workflow_session'
const SESSION_SECONDS = 60 * 60 * 24 * 7
const demoPassword = 'Demo1234!'
const memorySessions = new Map<string, { userId: string; expiresAt: number }>()

interface CredentialRecord extends AuthUser {
  passwordHash: string | null
}

function tokenHash(token: string) {
  const secret = useRuntimeConfig().sessionSecret || 'workflow-development-session-secret'
  return createHash('sha256').update(`${secret}:${token}`).digest('hex')
}

function mapUser(row: Record<string, unknown>): AuthUser {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role) as UserRole,
    status: String(row.status) as AuthUser['status'],
    customerId: row.customer_id ? String(row.customer_id) : null,
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const database = getDatabase()
  let record: CredentialRecord | null
  if (database) {
    const rows = await database`SELECT id, name, email, role, status, customer_id, password_hash FROM users WHERE lower(email) = lower(${email}) LIMIT 1`
    record = rows[0] ? { ...mapUser(rows[0]), passwordHash: String(rows[0].password_hash) } : null
  } else {
    const user = demoStore.users.find(item => item.email.toLowerCase() === email.toLowerCase())
    record = user ? { ...user, passwordHash: null } : null
  }
  if (!record || record.status !== 'active') return null
  const passwordMatches = record.passwordHash ? await compare(password, record.passwordHash) : password === demoPassword
  if (!passwordMatches) return null
  const { passwordHash: _passwordHash, ...user } = record
  return user
}

export async function registerClient(input: { name: string; email: string; company: string; password: string }): Promise<AuthUser> {
  const database = getDatabase()
  const existing = database
    ? await database`SELECT id FROM users WHERE lower(email) = lower(${input.email}) LIMIT 1`
    : demoStore.users.filter(user => user.email.toLowerCase() === input.email.toLowerCase())
  if (existing.length) throw createError({ statusCode: 409, statusMessage: 'Пользователь с таким email уже существует' })

  const customerId = `customer-${randomUUID()}`
  const user: AuthUser = { id: `user-${randomUUID()}`, name: input.name, email: input.email.toLowerCase(), role: 'client', status: 'active', customerId }
  if (database) {
    const passwordHash = await hash(input.password, 12)
    await database.begin(async transaction => {
      await transaction`INSERT INTO customers (id, name, email, phone, company) VALUES (${customerId}, ${input.name}, ${input.email.toLowerCase()}, ${''}, ${input.company})`
      await transaction`INSERT INTO users (id, name, email, password_hash, role, status, customer_id) VALUES (${user.id}, ${user.name}, ${user.email}, ${passwordHash}, ${user.role}, ${user.status}, ${customerId})`
    })
  } else {
    demoStore.customers.push({ id: customerId, name: input.name, email: input.email.toLowerCase(), phone: '', company: input.company, createdAt: new Date().toISOString() })
    demoStore.users.push(user)
  }
  return user
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString('base64url')
  const hashed = tokenHash(token)
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000)
  const database = getDatabase()
  if (database) await database`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (${hashed}, ${userId}, ${expiresAt.toISOString()})`
  else memorySessions.set(hashed, { userId, expiresAt: expiresAt.getTime() })
  return token
}

export async function resolveUserSession(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null
  const hashed = tokenHash(token)
  const database = getDatabase()
  if (database) {
    const rows = await database`SELECT u.id, u.name, u.email, u.role, u.status, u.customer_id FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ${hashed} AND s.expires_at > now() AND u.status = 'active' LIMIT 1`
    return rows[0] ? mapUser(rows[0]) : null
  }
  const session = memorySessions.get(hashed)
  if (!session || session.expiresAt <= Date.now()) {
    memorySessions.delete(hashed)
    return null
  }
  return demoStore.users.find(user => user.id === session.userId && user.status === 'active') ?? null
}

export async function deleteUserSession(token: string | undefined) {
  if (!token) return
  const hashed = tokenHash(token)
  const database = getDatabase()
  if (database) await database`DELETE FROM sessions WHERE token_hash = ${hashed}`
  else memorySessions.delete(hashed)
}

export function readSessionCookie(event: Parameters<typeof getCookie>[0]) {
  return getCookie(event, COOKIE_NAME)
}

export function writeSessionCookie(event: Parameters<typeof setCookie>[0], token: string) {
  setCookie(event, COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: !import.meta.dev, path: '/', maxAge: SESSION_SECONDS })
}

export function clearSessionCookie(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
