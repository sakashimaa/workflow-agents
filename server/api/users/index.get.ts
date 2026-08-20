import { listUsers } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async event => listUsers(await requireUser(event)))
