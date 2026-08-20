import { z } from 'zod'
import { createUserSession, registerClient, writeSessionCookie } from '../../services/session'
import { parseRequestBody } from '../../utils/validated-body'

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform(value => value.toLowerCase()),
  company: z.string().trim().min(2).max(160),
  password: z.string().min(8).max(200),
})

export default defineEventHandler(async (event) => {
  const input = await parseRequestBody(event, registerSchema)
  const user = await registerClient(input)
  writeSessionCookie(event, await createUserSession(user.id))
  setResponseStatus(event, 201)
  return user
})
