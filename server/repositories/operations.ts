import { randomUUID } from 'node:crypto'
import { canReadRequest } from '#shared/domain/request-access'
import { requestPriorities, requestStatuses, type AnalyticsSummary, type AttachmentSummary, type AuthUser, type CategorySummary, type NotificationSummary, type RequestPriority, type SlaPolicy, type UserSummary } from '#shared/types/domain'
import { getDatabase } from '../database/client'
import { demoStore } from '../utils/demo-store'

type DatabaseRow = Record<string, unknown>

function asIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  return new Date(String(value)).toISOString()
}

function mapNotification(row: DatabaseRow): NotificationSummary {
  return { id: String(row.id), type: String(row.type) as NotificationSummary['type'], title: String(row.title), body: String(row.body), readAt: row.read_at ? asIso(row.read_at) : null, createdAt: asIso(row.created_at) }
}

function mapAttachment(row: DatabaseRow): AttachmentSummary {
  return { id: String(row.id), requestId: String(row.request_id), filename: String(row.filename), mimeType: String(row.mime_type), size: Number(row.size), url: String(row.url), uploadedBy: String(row.uploaded_by), createdAt: asIso(row.created_at) }
}

export async function createNotification(userId: string, type: NotificationSummary['type'], title: string, body: string, id: string = randomUUID()) {
  const database = getDatabase()
  if (!database) {
    if (!demoStore.notifications.some(item => item.id === id)) demoStore.notifications.unshift({ id, userId, type, title, body, readAt: null, createdAt: new Date().toISOString() })
    return
  }
  await database`INSERT INTO notifications (id, user_id, type, title, body) VALUES (${id}, ${userId}, ${type}, ${title}, ${body}) ON CONFLICT (id) DO NOTHING`
}

export async function listNotifications(user: AuthUser): Promise<NotificationSummary[]> {
  const database = getDatabase()
  if (database) {
    const rows = await database`SELECT id, type, title, body, read_at, created_at FROM notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 100`
    return rows.map(mapNotification)
  }
  return demoStore.notifications.filter(item => item.userId === user.id).map(({ userId: _userId, ...item }) => item)
}

export async function markNotificationsRead(user: AuthUser, id?: string): Promise<void> {
  const readAt = new Date().toISOString()
  const database = getDatabase()
  if (database) {
    if (id) await database`UPDATE notifications SET read_at = ${readAt} WHERE id = ${id} AND user_id = ${user.id}`
    else await database`UPDATE notifications SET read_at = ${readAt} WHERE user_id = ${user.id} AND read_at IS NULL`
    return
  }
  for (const item of demoStore.notifications) if (item.userId === user.id && (!id || item.id === id)) item.readAt = readAt
}

export async function listSlaPolicies(): Promise<SlaPolicy[]> {
  const database = getDatabase()
  if (!database) return demoStore.slaPolicies
  const rows = await database`SELECT priority, response_minutes, resolution_minutes, is_active, updated_at FROM sla_policies`
  return rows.map(row => ({ priority: String(row.priority) as RequestPriority, responseMinutes: Number(row.response_minutes), resolutionMinutes: Number(row.resolution_minutes), isActive: Boolean(row.is_active), updatedAt: asIso(row.updated_at) })).sort((a, b) => requestPriorities.indexOf(a.priority) - requestPriorities.indexOf(b.priority))
}

export async function updateSlaPolicy(priority: RequestPriority, input: Pick<SlaPolicy, 'responseMinutes' | 'resolutionMinutes' | 'isActive'>): Promise<SlaPolicy> {
  const updatedAt = new Date().toISOString()
  const database = getDatabase()
  if (!database) {
    const current = demoStore.slaPolicies.find(item => item.priority === priority)
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Политика SLA не найдена' })
    Object.assign(current, input, { updatedAt })
    return current
  }
  const rows = await database`UPDATE sla_policies SET response_minutes = ${input.responseMinutes}, resolution_minutes = ${input.resolutionMinutes}, is_active = ${input.isActive}, updated_at = now() WHERE priority = ${priority} RETURNING priority, response_minutes, resolution_minutes, is_active, updated_at`
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Политика SLA не найдена' })
  return { priority, responseMinutes: Number(rows[0].response_minutes), resolutionMinutes: Number(rows[0].resolution_minutes), isActive: Boolean(rows[0].is_active), updatedAt: asIso(rows[0].updated_at) }
}

export async function listAttachments(requestId: string): Promise<AttachmentSummary[]> {
  const database = getDatabase()
  if (!database) return demoStore.attachments.filter(item => item.requestId === requestId)
  return (await database`SELECT id, request_id, filename, mime_type, size, url, uploaded_by, created_at FROM attachments WHERE request_id = ${requestId} ORDER BY created_at DESC`).map(mapAttachment)
}

export async function findAttachment(id: string): Promise<AttachmentSummary | null> {
  const database = getDatabase()
  if (!database) return demoStore.attachments.find(item => item.id === id) ?? null
  const rows = await database`SELECT id, request_id, filename, mime_type, size, url, uploaded_by, created_at FROM attachments WHERE id = ${id} LIMIT 1`
  return rows[0] ? mapAttachment(rows[0]) : null
}

export async function createAttachment(requestId: string, file: { id: string; filename: string; mimeType: string; size: number }, actor: AuthUser): Promise<AttachmentSummary> {
  const attachment: AttachmentSummary = { ...file, requestId, url: `/api/attachments/${file.id}`, uploadedBy: actor.id, createdAt: new Date().toISOString() }
  const database = getDatabase()
  if (!database) demoStore.attachments.unshift(attachment)
  else await database`INSERT INTO attachments (id, request_id, filename, mime_type, size, url, uploaded_by, created_at) VALUES (${attachment.id}, ${requestId}, ${attachment.filename}, ${attachment.mimeType}, ${attachment.size}, ${attachment.url}, ${attachment.uploadedBy}, ${attachment.createdAt})`
  return attachment
}

export async function updateUserAdmin(id: string, input: Pick<UserSummary, 'role' | 'status'>): Promise<UserSummary> {
  const database = getDatabase()
  if (!database) {
    const user = demoStore.users.find(item => item.id === id)
    if (!user) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
    Object.assign(user, input)
    return user
  }
  const rows = await database`UPDATE users SET role = ${input.role}, status = ${input.status} WHERE id = ${id} RETURNING id, name, email, role, status, customer_id`
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
  return { id: String(rows[0].id), name: String(rows[0].name), email: String(rows[0].email), role: String(rows[0].role) as UserSummary['role'], status: String(rows[0].status) as UserSummary['status'], customerId: rows[0].customer_id ? String(rows[0].customer_id) : null }
}

export async function updateCategoryAdmin(id: string, input: Pick<CategorySummary, 'name' | 'description' | 'isActive'>): Promise<CategorySummary> {
  const database = getDatabase()
  if (!database) {
    const category = demoStore.categories.find(item => item.id === id)
    if (!category) throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' })
    Object.assign(category, input)
    return category
  }
  const rows = await database`UPDATE categories SET name = ${input.name}, description = ${input.description}, is_active = ${input.isActive} WHERE id = ${id} RETURNING id, name, description, is_active`
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' })
  return { id: String(rows[0].id), name: String(rows[0].name), description: String(rows[0].description), isActive: Boolean(rows[0].is_active) }
}

function emptyCounts<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map(value => [value, 0])) as Record<T, number>
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const database = getDatabase()
  const requests = database
    ? (await database`SELECT status, priority, assignee_id, sla_due_at, closed_at FROM requests WHERE archived = false`).map(row => ({ status: String(row.status), priority: String(row.priority), assigneeId: row.assignee_id ? String(row.assignee_id) : null, slaDueAt: asIso(row.sla_due_at), closedAt: row.closed_at ? asIso(row.closed_at) : null }))
    : demoStore.requests
  const users = database
    ? (await database`SELECT id, name, status FROM users WHERE role = 'agent' ORDER BY name`).map(row => ({ id: String(row.id), name: String(row.name), status: String(row.status) as UserSummary['status'] }))
    : demoStore.users.filter(user => user.role === 'agent')
  const byStatus = emptyCounts(requestStatuses)
  const byPriority = emptyCounts(requestPriorities)
  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  for (const request of requests) { byStatus[request.status as keyof typeof byStatus] += 1; byPriority[request.priority as keyof typeof byPriority] += 1 }
  const active = requests.filter(request => !['resolved', 'closed'].includes(request.status))
  const overdue = active.filter(request => Date.parse(request.slaDueAt) < now).length
  const completed = requests.filter(request => ['resolved', 'closed'].includes(request.status))
  return {
    total: requests.length,
    open: active.length,
    overdue,
    resolvedToday: requests.filter(request => request.closedAt?.startsWith(today)).length,
    slaCompliance: completed.length ? Math.round((completed.filter(request => !request.closedAt || Date.parse(request.closedAt) <= Date.parse(request.slaDueAt)).length / completed.length) * 100) : 100,
    byStatus,
    byPriority,
    agentLoad: users.map(user => ({ ...user, open: active.filter(request => request.assigneeId === user.id).length })),
  }
}

export async function createSlaNotifications(user: AuthUser): Promise<void> {
  const database = getDatabase()
  const requests = database
    ? await database`SELECT id, title, customer_id, assignee_id, sla_due_at, status FROM requests WHERE archived = false AND status NOT IN ('resolved', 'closed') AND sla_due_at <= now() + interval '60 minutes'`
    : demoStore.requests.filter(request => !['resolved', 'closed'].includes(request.status) && Date.parse(request.slaDueAt) <= Date.now() + 3600000).map(request => ({ id: request.id, title: request.title, customer_id: request.customerId, assignee_id: request.assigneeId, sla_due_at: request.slaDueAt, status: request.status }))
  for (const request of requests) {
    const view = { customerId: String(request.customer_id), assigneeId: request.assignee_id ? String(request.assignee_id) : null } as Parameters<typeof canReadRequest>[1]
    if (canReadRequest(user, view)) await createNotification(user.id, 'sla', 'Приближается срок SLA', `${request.id} · ${request.title}`, `sla-${user.id}-${request.id}`)
  }
}
