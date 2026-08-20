import { canReadRequest } from '#shared/domain/request-access'
import { listAttachments } from '../../../repositories/operations'
import { findRequest } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })
  return listAttachments(id)
})
