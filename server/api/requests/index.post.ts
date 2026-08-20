import { requestPriorities } from '#shared/types/domain'
import { z } from 'zod'
import { createRequest } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'
import { parseRequestBody } from '../../utils/validated-body'

const createRequestSchema = z.object({
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(requestPriorities).default('normal'),
  customerId: z.string().optional(),
  categoryId: z.string().default('category-settings'),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ['client', 'operator', 'admin'])
  const input = await parseRequestBody(event, createRequestSchema)
  const customerId = user.role === 'client' ? user.customerId : input.customerId
  if (!customerId) throw createError({ statusCode: 422, statusMessage: 'Выберите клиента' })
  const request = await createRequest({ ...input, customerId }, user)
  setResponseStatus(event, 201)
  return request
})
