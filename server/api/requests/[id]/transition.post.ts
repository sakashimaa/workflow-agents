import { validateRequestTransition } from '#shared/domain/request-transitions'
import { requestStatuses } from '#shared/types/domain'
import { z } from 'zod'
import { canReadRequest } from '#shared/domain/request-access'
import { findRequest, transitionRequest } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const transitionSchema = z.object({
  to: z.enum(requestStatuses),
  reason: z.string().trim().max(1000).optional(),
  resolution: z.string().trim().max(5000).optional(),
  expectedVersion: z.number().int().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })
  const input = await parseRequestBody(event, transitionSchema)
  const validation = validateRequestTransition({ from: request.status, to: input.to, role: user.role, hasAssignee: Boolean(request.assigneeId), isAssignedAgent: request.assigneeId === user.id, reason: input.reason, resolution: input.resolution })
  if (!validation.valid) throw createError({ statusCode: validation.code === 'FORBIDDEN' ? 403 : 409, statusMessage: validation.message })
  return transitionRequest(id, input, user)
})
