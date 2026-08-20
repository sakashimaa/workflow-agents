import { z } from 'zod'
import { userRoles } from '#shared/types/domain'
import { updateUserAdmin } from '../../../repositories/operations'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const schema = z.object({ role: z.enum(userRoles), status: z.enum(['active', 'inactive']) })

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event, ['admin'])
  const id = getRouterParam(event, 'id') ?? ''
  const input = await parseRequestBody(event, schema)
  if (id === actor.id && input.status === 'inactive') throw createError({ statusCode: 409, statusMessage: 'Нельзя деактивировать собственную учётную запись' })
  return updateUserAdmin(id, input)
})
