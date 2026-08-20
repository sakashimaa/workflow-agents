import { z } from 'zod'
import { requestPriorities } from '#shared/types/domain'
import { updateSlaPolicy } from '../../../repositories/operations'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const schema = z.object({ responseMinutes: z.number().int().min(1).max(525600), resolutionMinutes: z.number().int().min(1).max(525600), isActive: z.boolean() }).refine(value => value.resolutionMinutes >= value.responseMinutes, { message: 'Срок решения не может быть меньше срока ответа' })

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const priority = getRouterParam(event, 'priority')
  if (!requestPriorities.includes(priority as typeof requestPriorities[number])) throw createError({ statusCode: 404, statusMessage: 'Политика SLA не найдена' })
  return updateSlaPolicy(priority as typeof requestPriorities[number], await parseRequestBody(event, schema))
})
