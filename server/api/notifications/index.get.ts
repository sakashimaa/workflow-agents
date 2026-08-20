import { createSlaNotifications, listNotifications } from '../../repositories/operations'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await createSlaNotifications(user)
  return listNotifications(user)
})
