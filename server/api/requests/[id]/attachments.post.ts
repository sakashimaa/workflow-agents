import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { canReadRequest } from '#shared/domain/request-access'
import { createAttachment, listAttachments } from '../../../repositories/operations'
import { findRequest } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'

const maximumFiles = 5
const maximumSize = 5 * 1024 * 1024
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf', 'text/plain'])

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const request = await findRequest(id)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (!canReadRequest(user, request)) throw createError({ statusCode: 403, statusMessage: 'Нет доступа к этой заявке' })

  const parts = await readMultipartFormData(event)
  const files = parts?.filter(part => part.name === 'files' && part.filename) ?? []
  if (!files.length) throw createError({ statusCode: 422, statusMessage: 'Выберите хотя бы один файл' })
  const existing = await listAttachments(id)
  if (existing.length + files.length > maximumFiles) throw createError({ statusCode: 422, statusMessage: `К заявке можно прикрепить не более ${maximumFiles} файлов` })
  for (const file of files) {
    if (!file.data.length || file.data.length > maximumSize) throw createError({ statusCode: 413, statusMessage: 'Размер каждого файла должен быть от 1 байта до 5 МБ' })
    if (!file.type || !allowedTypes.has(file.type)) throw createError({ statusCode: 415, statusMessage: 'Разрешены JPG, PNG, PDF и TXT' })
  }

  const directory = resolve(process.cwd(), '.data', 'uploads')
  await mkdir(directory, { recursive: true })
  const created = []
  for (const file of files) {
    const fileId = randomUUID()
    await writeFile(resolve(directory, fileId), file.data, { flag: 'wx' })
    created.push(await createAttachment(id, { id: fileId, filename: file.filename!.replace(/[\r\n]/g, '').slice(0, 255), mimeType: file.type!, size: file.data.length }, user))
  }
  setResponseStatus(event, 201)
  return created
})
