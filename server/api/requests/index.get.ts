import { priorityRank } from '#shared/constants/requests'
import { requestPriorities, requestStatuses } from '#shared/types/domain'
import { z } from 'zod'
import { demoStore } from '../../utils/demo-store'

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(requestStatuses).optional(),
  priority: z.enum(requestPriorities).optional(),
  customerId: z.string().optional(),
  assigneeId: z.string().optional(),
  sort: z.enum(['updated', 'priority']).default('updated'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(6),
  demo: z.enum(['delay', 'error', 'rate-limit', 'empty']).optional(),
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Некорректные параметры списка', data: parsed.error.flatten() })
  const query = parsed.data

  if (query.demo === 'delay') await new Promise(resolve => setTimeout(resolve, 3000))
  if (query.demo === 'error') throw createError({ statusCode: 500, statusMessage: 'Временная ошибка сервиса' })
  if (query.demo === 'rate-limit') throw createError({ statusCode: 429, statusMessage: 'Слишком много запросов' })

  let filtered = query.demo === 'empty' ? [] : demoStore.requests.filter(request => !request.archived)
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
  return {
    data: filtered.slice(start, start + query.pageSize),
    meta: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.max(1, Math.ceil(total / query.pageSize)) },
  }
})
