import { requestPriorities, requestStatuses } from '#shared/types/domain'
import { z } from 'zod'
import { parseRequestBody } from '../../utils/validated-body'
import { demoStore } from '../../utils/demo-store'

const updateSchema = z.object({
  title: z.string().trim().min(5).max(140).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  status: z.enum(requestStatuses).optional(),
  priority: z.enum(requestPriorities).optional(),
  assigneeId: z.string().nullable().optional(),
}).refine(input => Object.keys(input).length > 0, 'Не переданы изменения')

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (query.demo === 'delay') await new Promise(resolve => setTimeout(resolve, 1500))
  if (query.demo === 'conflict') throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })
  if (query.demo === 'error') throw createError({ statusCode: 500, statusMessage: 'Не удалось сохранить изменение' })

  const input = await parseRequestBody(event, updateSchema)
  const request = demoStore.requests.find(item => item.id === getRouterParam(event, 'id'))
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (request.status === 'closed' && input.description) throw createError({ statusCode: 409, statusMessage: 'Описание закрытой заявки нельзя изменить' })

  if (input.assigneeId !== undefined) {
    const assignee = input.assigneeId ? demoStore.users.find(user => user.id === input.assigneeId && user.role === 'agent') : null
    if (input.assigneeId && !assignee) throw createError({ statusCode: 422, statusMessage: 'Исполнитель не найден' })
    if (assignee?.status === 'inactive') throw createError({ statusCode: 409, statusMessage: 'Нельзя назначить неактивного исполнителя' })
    request.assigneeId = assignee?.id ?? null
    request.assignee = assignee?.name ?? null
  }
  if (input.title !== undefined) request.title = input.title
  if (input.description !== undefined) request.description = input.description
  if (input.status !== undefined) request.status = input.status
  if (input.priority !== undefined) request.priority = input.priority
  request.updatedAt = new Date().toISOString()
  return request
})
