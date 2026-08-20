import { z } from 'zod'
import { authenticateUser, createUserSession, writeSessionCookie } from '../../services/session'
import { parseRequestBody } from '../../utils/validated-body'

const loginSchema = z.object({ email: z.email().transform(value => value.toLowerCase()), password: z.string().min(8).max(200) })

export default defineEventHandler(async (event) => {
  const credentials = await parseRequestBody(event, loginSchema)
  const user = await authenticateUser(credentials.email, credentials.password)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Неверный email или пароль' })
  const token = await createUserSession(user.id)
  writeSessionCookie(event, token)
  return user
})
