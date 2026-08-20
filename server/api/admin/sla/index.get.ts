import { listSlaPolicies } from '../../../repositories/operations'
import { requireUser } from '../../../utils/auth'

export default defineEventHandler(async event => { await requireUser(event, ['admin']); return listSlaPolicies() })
