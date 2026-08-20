import { demoStore } from '../../utils/demo-store'

export default defineEventHandler((event) => {
  const request = demoStore.requests.find(item => item.id === getRouterParam(event, 'id') && !item.archived)
  if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  return request
})
