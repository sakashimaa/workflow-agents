import { listCategories } from '../../../repositories/workflow'
import { requireUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => { await requireUser(event, ['admin']); return listCategories() })
