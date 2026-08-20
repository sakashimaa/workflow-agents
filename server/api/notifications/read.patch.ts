import { z } from 'zod'
import { markNotificationsRead } from '../../repositories/operations'
import { requireUser } from '../../utils/auth'
import { parseRequestBody } from '../../utils/validated-body'

const schema = z.object({ id: z.string().min(1).optional() })

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await parseRequestBody(event, schema)
  await markNotificationsRead(user, input.id)
  return { ok: true }
})
