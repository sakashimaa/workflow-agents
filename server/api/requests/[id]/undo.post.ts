import { z } from 'zod'
import { canReadRequest } from '#shared/domain/request-access'
import { findRequest, transitionRequest } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const undoSchema = z.object({ expectedVersion: z.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })
  const input = await parseRequestBody(event, undoSchema)
  const lastTransition = [...request.timeline].reverse().find(item => item.fromStatus && item.toStatus === request.status)
  if (!lastTransition?.fromStatus || lastTransition.actorId !== user.id) throw createError({ statusCode: 409, statusMessage: 'Последний переход нельзя отменить' })
  return transitionRequest(id, { to: lastTransition.fromStatus, expectedVersion: input.expectedVersion, undo: true }, user)
})
