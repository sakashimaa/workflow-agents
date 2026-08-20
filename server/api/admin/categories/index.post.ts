import { z } from 'zod'
import { createCategoryAdmin } from '../../../repositories/operations'
import { requireUser } from '../../../utils/auth'
import { parseRequestBody } from '../../../utils/validated-body'

const schema = z.object({ name: z.string().trim().min(2).max(80), description: z.string().trim().min(2).max(500), isActive: z.boolean().default(true) })

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  setResponseStatus(event, 201)
  return createCategoryAdmin(await parseRequestBody(event, schema))
})
