import { z } from 'zod'
import { canReadRequest } from '#shared/domain/request-access'
import { addRequestComment, findRequest } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const commentSchema = z.object({ body: z.string().trim().min(1).max(5000) })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const request = await findRequest(getRouterParam(event, 'id') ?? '')
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })
  const input = await parseRequestBody(event, commentSchema)
  const comment = await addRequestComment(request, input.body, user)
  setResponseStatus(event, 201)
  return comment
})
