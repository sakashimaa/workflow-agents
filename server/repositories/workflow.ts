import { randomUUID } from 'node:crypto'
import { priorityRank } from '#shared/constants/requests'
import type { AuthUser, CategorySummary, CustomerSummary, PaginatedResponse, RequestComment, RequestPriority, RequestStatus, ServiceRequest, UserSummary } from '#shared/types/domain'
import { getDatabase } from '../database/client'
import { demoStore } from '../utils/demo-store'

type DatabaseRow = Record<string, unknown>

export interface RequestListQuery {
  q?: string
  status?: RequestStatus
  priority?: RequestPriority
  customerId?: string
  assigneeId?: string
  sort: 'updated' | 'priority'
  page: number
  pageSize: number
  empty?: boolean
}

export interface CreateRequestInput {
  title: string
  description: string
  priority: RequestPriority
  customerId: string
  categoryId: string
}

export interface UpdateRequestInput {
  title?: string
  description?: string
  priority?: RequestPriority
  assigneeId?: string | null
  expectedVersion?: number
}

function asIso(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  return new Date(String(value)).toISOString()
}

function mapComment(row: DatabaseRow): RequestComment {
  const name = String(row.author_name)
  return { id: String(row.id), requestId: String(row.request_id), authorId: String(row.author_id), author: name, avatar: name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), body: String(row.body), createdAt: asIso(row.created_at) }
}

function mapRequest(row: DatabaseRow, comments: RequestComment[] = [], timeline: ServiceRequest['timeline'] = []): ServiceRequest {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    status: String(row.status) as RequestStatus,
    priority: String(row.priority) as RequestPriority,
    customerId: String(row.customer_id),
    customer: String(row.customer_name),
    customerCompany: String(row.customer_company),
    assigneeId: row.assignee_id ? String(row.assignee_id) : null,
    assignee: row.assignee_name ? String(row.assignee_name) : null,
    categoryId: String(row.category_id),
    category: String(row.category_name),
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
    slaDueAt: asIso(row.sla_due_at),
    closedAt: row.closed_at ? asIso(row.closed_at) : null,
    archived: Boolean(row.archived),
    version: Number(row.version),
    comments,
    timeline,
  }
}

function visibleTo(user: AuthUser, request: ServiceRequest) {
  if (user.role === 'client') return Boolean(user.customerId && request.customerId === user.customerId)
  if (user.role === 'agent') return request.assigneeId === user.id
  return true
}

export function canReadRequest(user: AuthUser, request: ServiceRequest) {
  return visibleTo(user, request)
}

async function databaseRequests(): Promise<ServiceRequest[]> {
  const database = getDatabase()
  if (!database) return demoStore.requests
  const rows = await database`
    SELECT r.*, c.name AS customer_name, c.company AS customer_company,
           u.name AS assignee_name, cat.name AS category_name
    FROM requests r
    JOIN customers c ON c.id = r.customer_id
    LEFT JOIN users u ON u.id = r.assignee_id
    JOIN categories cat ON cat.id = r.category_id
    WHERE r.archived = false
  `
  return rows.map(row => mapRequest(row))
}

export async function listRequests(query: RequestListQuery, user: AuthUser): Promise<PaginatedResponse<ServiceRequest>> {
  let filtered = query.empty ? [] : (await databaseRequests()).filter(request => visibleTo(user, request) && !request.archived)
  if (query.q) {
    const search = query.q.toLocaleLowerCase('ru')
    filtered = filtered.filter(request => `${request.id} ${request.title} ${request.customer} ${request.customerCompany}`.toLocaleLowerCase('ru').includes(search))
  }
  if (query.status) filtered = filtered.filter(request => request.status === query.status)
  if (query.priority) filtered = filtered.filter(request => request.priority === query.priority)
  if (query.customerId) filtered = filtered.filter(request => request.customerId === query.customerId)
  if (query.assigneeId) filtered = filtered.filter(request => request.assigneeId === query.assigneeId)
  filtered.sort((a, b) => query.sort === 'priority' ? priorityRank[a.priority] - priorityRank[b.priority] : b.updatedAt.localeCompare(a.updatedAt))
  const total = filtered.length
  const start = (query.page - 1) * query.pageSize
  return { data: filtered.slice(start, start + query.pageSize), meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)) } }
}

export async function findRequest(id: string): Promise<ServiceRequest | null> {
  const database = getDatabase()
  if (!database) return demoStore.requests.find(request => request.id === id && !request.archived) ?? null
  const rows = await database`
    SELECT r.*, c.name AS customer_name, c.company AS customer_company,
           u.name AS assignee_name, cat.name AS category_name
    FROM requests r
    JOIN customers c ON c.id = r.customer_id
    LEFT JOIN users u ON u.id = r.assignee_id
    JOIN categories cat ON cat.id = r.category_id
    WHERE r.id = ${id} AND r.archived = false LIMIT 1
  `
  if (!rows[0]) return null
  const commentRows = await database`SELECT c.*, u.name AS author_name FROM comments c JOIN users u ON u.id = c.author_id WHERE c.request_id = ${id} ORDER BY c.created_at`
  const eventRows = await database`SELECT id, actor_id, kind, title, detail, from_status, to_status, created_at FROM request_events WHERE request_id = ${id} ORDER BY created_at`
  return mapRequest(rows[0], commentRows.map(row => mapComment(row)), eventRows.map(row => ({ id: String(row.id), actorId: row.actor_id ? String(row.actor_id) : null, kind: String(row.kind) as ServiceRequest['timeline'][number]['kind'], title: String(row.title), detail: String(row.detail), fromStatus: row.from_status ? String(row.from_status) as RequestStatus : null, toStatus: row.to_status ? String(row.to_status) as RequestStatus : null, createdAt: asIso(row.created_at) })))
}

export async function listUsers(user: AuthUser): Promise<UserSummary[]> {
  const database = getDatabase()
  const users = database
    ? (await database`SELECT id, name, email, role, status, customer_id FROM users ORDER BY name`).map(row => ({ id: String(row.id), name: String(row.name), email: String(row.email), role: String(row.role) as UserSummary['role'], status: String(row.status) as UserSummary['status'], customerId: row.customer_id ? String(row.customer_id) : null }))
    : demoStore.users
  return ['operator', 'admin'].includes(user.role) ? users : users.filter(item => item.role === 'agent' && item.status === 'active').map(item => ({ ...item, email: '' }))
}

export async function listCustomers(user: AuthUser): Promise<CustomerSummary[]> {
  const database = getDatabase()
  const customers = database
    ? (await database`SELECT id, name, email, phone, company, created_at FROM customers ORDER BY company`).map(row => ({ id: String(row.id), name: String(row.name), email: String(row.email), phone: String(row.phone), company: String(row.company), createdAt: asIso(row.created_at) }))
    : demoStore.customers
  return user.role === 'client' ? customers.filter(customer => customer.id === user.customerId) : customers
}

export async function listCategories(): Promise<CategorySummary[]> {
  const database = getDatabase()
  return database
    ? (await database`SELECT id, name, description, is_active FROM categories ORDER BY name`).map(row => ({ id: String(row.id), name: String(row.name), description: String(row.description), isActive: Boolean(row.is_active) }))
    : demoStore.categories
}

export async function createRequest(input: CreateRequestInput, actor: AuthUser): Promise<ServiceRequest> {
  const database = getDatabase()
  if (!database) {
    const customer = demoStore.customers.find(item => item.id === input.customerId)
    const category = demoStore.categories.find(item => item.id === input.categoryId && item.isActive)
    if (!customer || !category) throw createError({ statusCode: 422, statusMessage: 'Клиент или категория не найдены' })
    const sequence = Math.max(...demoStore.requests.map(item => Number(item.id.split('-')[1]))) + 1
    const now = new Date().toISOString()
    const resolutionMinutes = { critical: 60, high: 240, normal: 1440, low: 4320 }[input.priority]
    const request: ServiceRequest = { id: `REQ-${sequence}`, ...input, status: 'new', customer: customer.name, customerCompany: customer.company, assigneeId: null, assignee: null, category: category.name, createdAt: now, updatedAt: now, slaDueAt: new Date(Date.now() + resolutionMinutes * 60000).toISOString(), closedAt: null, archived: false, version: 1, comments: [], timeline: [{ id: randomUUID(), title: 'Заявка создана', detail: `${actor.name}, ${customer.company}`, createdAt: now, kind: 'created' }] }
    demoStore.requests.unshift(request)
    return request
  }
  const [customer] = await database`SELECT id FROM customers WHERE id = ${input.customerId}`
  const [category] = await database`SELECT id FROM categories WHERE id = ${input.categoryId} AND is_active = true`
  if (!customer || !category) throw createError({ statusCode: 422, statusMessage: 'Клиент или категория не найдены' })
  const [policy] = await database`SELECT resolution_minutes FROM sla_policies WHERE priority = ${input.priority} AND is_active = true`
  const dueAt = new Date(Date.now() + Number(policy?.resolution_minutes ?? 1440) * 60000).toISOString()
  const [sequence] = await database`SELECT nextval('request_number_seq') AS value`
  if (!sequence) throw createError({ statusCode: 500, statusMessage: 'Не удалось получить номер заявки' })
  const id = `REQ-${sequence.value}`
  await database.begin(async transaction => {
    await transaction`INSERT INTO requests (id, title, description, priority, customer_id, category_id, sla_due_at) VALUES (${id}, ${input.title}, ${input.description}, ${input.priority}, ${input.customerId}, ${input.categoryId}, ${dueAt})`
    await transaction`INSERT INTO request_events (id, request_id, actor_id, kind, title, detail) VALUES (${randomUUID()}, ${id}, ${actor.id}, 'created', 'Заявка создана', ${actor.name})`
  })
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 500, statusMessage: 'Не удалось прочитать созданную заявку' })
  return request
}

export async function updateRequest(id: string, input: UpdateRequestInput, actor: AuthUser): Promise<ServiceRequest> {
  const current = await findRequest(id)
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (input.expectedVersion !== undefined && current.version !== input.expectedVersion) throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })

  let assignee: UserSummary | null | undefined
  if (input.assigneeId !== undefined) {
    const users = await listUsers({ ...actor, role: 'admin' })
    assignee = input.assigneeId ? users.find(user => user.id === input.assigneeId && user.role === 'agent') : null
    if (input.assigneeId && !assignee) throw createError({ statusCode: 422, statusMessage: 'Исполнитель не найден' })
    if (assignee?.status === 'inactive') throw createError({ statusCode: 409, statusMessage: 'Нельзя назначить неактивного исполнителя' })
  }

  const database = getDatabase()
  if (!database) {
    if (input.title !== undefined) current.title = input.title
    if (input.description !== undefined) current.description = input.description
    if (input.priority !== undefined) current.priority = input.priority
    if (input.assigneeId !== undefined) { current.assigneeId = assignee?.id ?? null; current.assignee = assignee?.name ?? null; if (current.status === 'new' && assignee) current.status = 'assigned' }
    current.updatedAt = new Date().toISOString()
    current.version += 1
    current.timeline.push({ id: randomUUID(), title: 'Параметры заявки изменены', detail: actor.name, createdAt: current.updatedAt, kind: input.assigneeId !== undefined ? 'assignment' : 'status' })
    return current
  }
  await database.begin(async transaction => {
    const locked = await transaction`SELECT version FROM requests WHERE id = ${id} FOR UPDATE`
    if (!locked[0] || (input.expectedVersion !== undefined && Number(locked[0].version) !== input.expectedVersion)) throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })
    if (input.title !== undefined) await transaction`UPDATE requests SET title = ${input.title} WHERE id = ${id}`
    if (input.description !== undefined) await transaction`UPDATE requests SET description = ${input.description} WHERE id = ${id}`
    if (input.priority !== undefined) await transaction`UPDATE requests SET priority = ${input.priority} WHERE id = ${id}`
    if (input.assigneeId !== undefined) await transaction`UPDATE requests SET assignee_id = ${input.assigneeId}, status = CASE WHEN status = 'new' AND ${input.assigneeId}::text IS NOT NULL THEN 'assigned'::request_status ELSE status END WHERE id = ${id}`
    await transaction`UPDATE requests SET updated_at = now(), version = version + 1 WHERE id = ${id}`
    await transaction`INSERT INTO request_events (id, request_id, actor_id, kind, title, detail) VALUES (${randomUUID()}, ${id}, ${actor.id}, ${input.assigneeId !== undefined ? 'assignment' : 'status'}, 'Параметры заявки изменены', ${actor.name})`
  })
  return (await findRequest(id))!
}

export async function transitionRequest(id: string, input: { to: RequestStatus; reason?: string; resolution?: string; expectedVersion?: number; undo?: boolean }, actor: AuthUser): Promise<ServiceRequest> {
  const current = await findRequest(id)
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (input.expectedVersion !== undefined && current.version !== input.expectedVersion) throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })
  const fromStatus = current.status
  const now = new Date().toISOString()
  const database = getDatabase()
  if (!database) {
    current.status = input.to
    current.updatedAt = now
    current.version += 1
    if (input.to === 'closed') current.closedAt = now
    current.timeline.push({ id: randomUUID(), actorId: actor.id, title: input.undo ? `Отмена: ${fromStatus} → ${input.to}` : `Статус: ${input.to}`, detail: input.reason || input.resolution || actor.name, createdAt: now, kind: input.to === 'escalated' ? 'escalation' : 'status', fromStatus, toStatus: input.to })
    return current
  }
  await database.begin(async transaction => {
    const locked = await transaction`SELECT version FROM requests WHERE id = ${id} FOR UPDATE`
    if (!locked[0] || (input.expectedVersion !== undefined && Number(locked[0].version) !== input.expectedVersion)) throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })
    await transaction`UPDATE requests SET status = ${input.to}, waiting_reason = CASE WHEN ${input.to} = 'waiting' THEN ${input.reason ?? null} ELSE waiting_reason END, escalation_reason = CASE WHEN ${input.to} = 'escalated' THEN ${input.reason ?? null} ELSE escalation_reason END, resolution = CASE WHEN ${input.to} = 'resolved' THEN ${input.resolution ?? null} ELSE resolution END, closed_at = CASE WHEN ${input.to} = 'closed' THEN now() ELSE closed_at END, updated_at = now(), version = version + 1 WHERE id = ${id}`
    await transaction`INSERT INTO request_events (id, request_id, actor_id, kind, title, detail, from_status, to_status) VALUES (${randomUUID()}, ${id}, ${actor.id}, ${input.to === 'escalated' ? 'escalation' : 'status'}, ${input.undo ? `Отмена: ${fromStatus} → ${input.to}` : `Статус: ${input.to}`}, ${input.reason || input.resolution || actor.name}, ${fromStatus}, ${input.to})`
  })
  return (await findRequest(id))!
}

export async function addRequestComment(request: ServiceRequest, body: string, actor: AuthUser): Promise<RequestComment> {
  const now = new Date().toISOString()
  const comment: RequestComment = { id: randomUUID(), requestId: request.id, authorId: actor.id, author: actor.name, avatar: actor.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(), body, createdAt: now }
  const database = getDatabase()
  if (!database) {
    request.comments.push(comment)
    request.timeline.push({ id: randomUUID(), title: 'Добавлен комментарий', detail: actor.name, createdAt: now, kind: 'comment' })
    request.updatedAt = now
    return comment
  }
  await database.begin(async transaction => {
    await transaction`INSERT INTO comments (id, request_id, author_id, body, created_at) VALUES (${comment.id}, ${request.id}, ${actor.id}, ${body}, ${now})`
    await transaction`INSERT INTO request_events (id, request_id, actor_id, kind, title, detail, created_at) VALUES (${randomUUID()}, ${request.id}, ${actor.id}, 'comment', 'Добавлен комментарий', ${actor.name}, ${now})`
    await transaction`UPDATE requests SET updated_at = now() WHERE id = ${request.id}`
  })
  return comment
}
