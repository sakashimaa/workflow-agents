import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { canReadRequest } from '#shared/domain/request-access'
import { findAttachment } from '../../repositories/operations'
import { findRequest } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const attachment = await findAttachment(getRouterParam(event, 'id') ?? '')
  if (!attachment) throw createError({ statusCode: 404, statusMessage: 'Вложение не найдено' })
  const request = await findRequest(attachment.requestId)
  if (!request || !canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к вложению' })
  let content: Buffer
  try { content = await readFile(resolve(process.cwd(), '.data', 'uploads', attachment.id)) }
  catch { throw createError({ statusCode: 404, statusMessage: 'Файл не найден в хранилище' }) }
  setResponseHeader(event, 'content-type', attachment.mimeType)
  setResponseHeader(event, 'content-length', content.length)
  setResponseHeader(event, 'content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.filename)}`)
  setResponseHeader(event, 'x-content-type-options', 'nosniff')
  return content
})
