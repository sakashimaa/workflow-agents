import { listCustomers } from '../../repositories/workflow'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async event => listCustomers(await requireUser(event, ['operator', 'admin'])))
