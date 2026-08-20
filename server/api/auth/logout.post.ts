import { clearSessionCookie, deleteUserSession, readSessionCookie } from '../../services/session'

export default defineEventHandler(async (event) => {
  await deleteUserSession(readSessionCookie(event))
  clearSessionCookie(event)
  setResponseStatus(event, 204)
  return null
})
