import { requestPriorities, requestStatuses } from '#shared/types/domain'
import { z } from 'zod'
import { listRequests } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'

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
  const user = await requireUser(event)
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Некорректные параметры списка', data: parsed.error.flatten() })
  const query = parsed.data

  if (query.demo === 'delay') await new Promise(resolve => setTimeout(resolve, 3000))
  if (query.demo === 'error') throw createError({ statusCode: 500, statusMessage: 'Временная ошибка сервиса' })
  if (query.demo === 'rate-limit') throw createError({ statusCode: 429, statusMessage: 'Слишком много запросов' })

  return listRequests({ ...query, empty: query.demo === 'empty' }, user)
})
