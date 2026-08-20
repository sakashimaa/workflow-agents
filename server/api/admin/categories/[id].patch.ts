import { z } from 'zod'
import { updateCategoryAdmin } from '../../../repositories/operations'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const schema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().min(2).max(500), isActive: z.boolean() })

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  return updateCategoryAdmin(getRouterParam(event, 'id') ?? '', await parseRequestBody(event, schema))
})
