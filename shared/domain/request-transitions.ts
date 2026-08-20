import type { RequestStatus, UserRole } from '../types/domain'

export interface TransitionContext {
  from: RequestStatus
  to: RequestStatus
  role: UserRole
  hasAssignee: boolean
  isAssignedAgent: boolean
  reason?: string
  resolution?: string
}

export interface TransitionValidation {
  valid: boolean
  code?: 'INVALID_TRANSITION' | 'FORBIDDEN' | 'ASSIGNEE_REQUIRED' | 'REASON_REQUIRED' | 'RESOLUTION_REQUIRED'
  message?: string
}

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  new: ['assigned', 'escalated'],
  assigned: ['in_progress', 'escalated'],
  in_progress: ['waiting', 'resolved', 'escalated'],
  waiting: ['in_progress'],
  resolved: ['closed'],
  escalated: ['assigned'],
  closed: [],
}

export function validateRequestTransition(context: TransitionContext): TransitionValidation {
  if (!allowedTransitions[context.from].includes(context.to)) {
    return { valid: false, code: 'INVALID_TRANSITION', message: `Переход ${context.from} → ${context.to} запрещён` }
  }

  if (context.role === 'client' && !(context.from === 'resolved' && context.to === 'closed')) {
    return { valid: false, code: 'FORBIDDEN', message: 'Клиент может только подтвердить решённую заявку' }
  }
  if (context.role === 'agent' && !context.isAssignedAgent) {
    return { valid: false, code: 'FORBIDDEN', message: 'Исполнитель может менять только назначенные ему заявки' }
  }
  if (context.role === 'agent' && (context.to === 'assigned' || context.to === 'escalated' || context.to === 'closed')) {
    return { valid: false, code: 'FORBIDDEN', message: 'Этот переход доступен только оператору или администратору' }
  }
  if (context.to === 'escalated' && !['operator', 'admin'].includes(context.role)) {
    return { valid: false, code: 'FORBIDDEN', message: 'Эскалировать заявку может только оператор или администратор' }
  }
  if (context.to === 'assigned' && !context.hasAssignee) {
    return { valid: false, code: 'ASSIGNEE_REQUIRED', message: 'Перед назначением статуса выберите исполнителя' }
  }
  if ((context.to === 'waiting' || context.to === 'escalated') && !context.reason?.trim()) {
    return { valid: false, code: 'REASON_REQUIRED', message: 'Для перехода обязательна причина' }
  }
  if (context.to === 'resolved' && !context.resolution?.trim()) {
    return { valid: false, code: 'RESOLUTION_REQUIRED', message: 'Для решения заявки заполните результат' }
  }
  if (context.to === 'closed' && ['operator', 'admin'].includes(context.role) && !context.reason?.trim()) {
    return { valid: false, code: 'REASON_REQUIRED', message: 'При ручном закрытии оператор обязан указать причину' }
  }
  return { valid: true }
}

export function getAllowedTransitions(status: RequestStatus): RequestStatus[] {
  return [...allowedTransitions[status]]
}
