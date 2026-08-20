import type { PaginatedResponse, ServiceRequest } from '#shared/types/domain'

export type RequestApiDto = Partial<ServiceRequest> & Pick<ServiceRequest, 'id' | 'status' | 'priority'>
export interface RequestListApiResponse extends Omit<PaginatedResponse<ServiceRequest>, 'data'> {
  data: RequestApiDto[]
}

export function normalizeRequest(source: RequestApiDto): ServiceRequest {
  return {
    id: source.id,
    title: source.title?.trim() || 'Без названия',
    description: source.description?.trim() || 'Описание не добавлено.',
    status: source.status,
    priority: source.priority,
    customerId: source.customerId ?? 'unknown',
    customer: source.customer?.trim() || 'Неизвестный клиент',
    customerCompany: source.customerCompany?.trim() || 'Компания не указана',
    assigneeId: source.assigneeId ?? null,
    assignee: source.assignee?.trim() || null,
    categoryId: source.categoryId ?? 'unknown',
    category: source.category?.trim() || 'Без категории',
    createdAt: source.createdAt ?? new Date(0).toISOString(),
    updatedAt: source.updatedAt ?? source.createdAt ?? new Date(0).toISOString(),
    slaDueAt: source.slaDueAt ?? new Date(0).toISOString(),
    closedAt: source.closedAt ?? null,
    archived: source.archived ?? false,
    comments: source.comments ?? [],
    timeline: source.timeline ?? [],
  }
}
