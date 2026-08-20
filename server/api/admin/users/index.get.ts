import { listUsers } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ['admin'])
  return listUsers(user)
})
