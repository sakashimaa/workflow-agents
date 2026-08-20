import { z } from 'zod'
import { parseRequestBody } from '../../../utils/validated-body'
import { demoStore } from '../../../utils/demo-store'

const commentSchema = z.object({ body: z.string().trim().min(1).max(5000) })

export default defineEventHandler(async (event) => {
  const input = await parseRequestBody(event, commentSchema)
  const request = demoStore.requests.find(item => item.id === getRouterParam(event, 'id'))
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  const now = new Date().toISOString()
  const comment = { id: crypto.randomUUID(), requestId: request.id, authorId: 'user-operator', author: 'Анна Морозова', avatar: 'АМ', body: input.body, createdAt: now }
  request.comments.push(comment)
  request.timeline.push({ id: crypto.randomUUID(), title: 'Добавлен комментарий', detail: comment.author, createdAt: now, kind: 'comment' })
  request.updatedAt = now
  setResponseStatus(event, 201)
  return comment
})
