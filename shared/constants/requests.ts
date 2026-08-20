import type { RequestPriority, RequestStatus } from '../types/domain'

export const statusLabels: Record<RequestStatus, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  waiting: 'Ожидание',
  resolved: 'Решена',
  closed: 'Закрыта',
  escalated: 'Эскалация',
}

export const priorityLabels: Record<RequestPriority, string> = {
  critical: 'Критический',
  high: 'Высокий',
  normal: 'Обычный',
  low: 'Низкий',
}

export const priorityRank: Record<RequestPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
}
