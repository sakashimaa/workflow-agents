import { requestPriorities } from '#shared/types/domain'
import { z } from 'zod'
import { canReadRequest } from '#shared/domain/request-access'
import { findRequest, updateRequest } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'
import { parseRequestBody } from '../../utils/validated-body'

const updateSchema = z.object({
  title: z.string().trim().min(5).max(140).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  priority: z.enum(requestPriorities).optional(),
  assigneeId: z.string().nullable().optional(),
  expectedVersion: z.number().int().positive().optional(),
}).refine(input => Object.keys(input).some(key => key !== 'expectedVersion'), 'Не переданы изменения')

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (query.demo === 'delay') await new Promise(resolve => setTimeout(resolve, 1500))
  if (query.demo === 'conflict') throw createError({ statusCode: 409, statusMessage: 'Заявка уже изменена другим пользователем' })
  if (query.demo === 'error') throw createError({ statusCode: 500, statusMessage: 'Не удалось сохранить изменение' })
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })
  const input = await parseRequestBody(event, updateSchema)
  if ((input.priority !== undefined || input.assigneeId !== undefined) && !['operator', 'admin'].includes(user.role)) throw createError({ statusCode: 403, statusMessage: 'Приоритет и назначение меняет только оператор или администратор' })
  if ((input.title !== undefined || input.description !== undefined) && !['client', 'operator', 'admin'].includes(user.role)) throw createError({ statusCode: 403, statusMessage: 'Исполнитель не может менять описание заявки' })
  if (request.status === 'closed' && input.description !== undefined) throw createError({ statusCode: 409, statusMessage: 'Описание закрытой заявки нельзя изменить' })
  return updateRequest(id, input, user)
})
