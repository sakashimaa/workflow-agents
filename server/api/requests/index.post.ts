import { requestPriorities } from '#shared/types/domain'
import { z } from 'zod'
import { demoStore } from '../../utils/demo-store'
import { parseRequestBody } from '../../utils/validated-body'

const createRequestSchema = z.object({
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(requestPriorities).default('normal'),
  customerId: z.string().default('customer-northstar'),
  categoryId: z.string().default('category-settings'),
})

export default defineEventHandler(async (event) => {
  const input = await parseRequestBody(event, createRequestSchema)
  const customer = demoStore.customers.find(item => item.id === input.customerId)
  const category = demoStore.categories.find(item => item.id === input.categoryId)
  if (!customer || !category) throw createError({ statusCode: 422, statusMessage: 'Клиент или категория не найдены' })
  const sequence = Math.max(...demoStore.requests.map(item => Number(item.id.split('-')[1]))) + 1
  const now = new Date().toISOString()
  const request = {
    id: `REQ-${sequence}`,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: 'new' as const,
    customerId: customer.id,
    customer: customer.name,
    customerCompany: customer.company,
    assigneeId: null,
    assignee: null,
    categoryId: category.id,
    category: category.name,
    createdAt: now,
    updatedAt: now,
    slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    closedAt: null,
    archived: false,
    comments: [],
    timeline: [{ id: crypto.randomUUID(), title: 'Заявка создана', detail: `${customer.name}, ${customer.company}`, createdAt: now, kind: 'created' as const }],
  }
  demoStore.requests.unshift(request)
  setResponseStatus(event, 201)
  return request
})
