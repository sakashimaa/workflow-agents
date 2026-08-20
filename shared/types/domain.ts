export const requestStatuses = ['new', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed', 'escalated'] as const
export const requestPriorities = ['critical', 'high', 'normal', 'low'] as const
export const userRoles = ['client', 'operator', 'agent', 'admin'] as const

export type RequestStatus = typeof requestStatuses[number]
export type RequestPriority = typeof requestPriorities[number]
export type UserRole = typeof userRoles[number]

export interface RequestComment {
  id: string
  requestId: string
  authorId: string
  author: string
  avatar: string
  body: string
  createdAt: string
}

export interface RequestEvent {
  id: string
  title: string
  detail: string
  createdAt: string
  kind: 'created' | 'status' | 'comment' | 'assignment' | 'escalation'
  actorId?: string | null
  fromStatus?: RequestStatus | null
  toStatus?: RequestStatus | null
}

export interface ServiceRequest {
  id: string
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  customerId: string
  customer: string
  customerCompany: string
  assigneeId: string | null
  assignee: string | null
  categoryId: string
  category: string
  createdAt: string
  updatedAt: string
  slaDueAt: string
  closedAt: string | null
  archived: boolean
  version: number
  comments: RequestComment[]
  timeline: RequestEvent[]
}

export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  customerId: string | null
}

export type AuthUser = UserSummary

export interface CustomerSummary {
  id: string
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
}

export interface CategorySummary {
  id: string
  name: string
  description: string
  isActive: boolean
}

export interface AttachmentSummary {
  id: string
  requestId: string
  filename: string
  mimeType: string
  size: number
  url: string
  uploadedBy: string
  createdAt: string
}

export interface NotificationSummary {
  id: string
  type: 'assignment' | 'sla' | 'comment' | 'status'
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

export interface SlaPolicy {
  priority: RequestPriority
  responseMinutes: number
  resolutionMinutes: number
  isActive: boolean
  updatedAt: string
}

export interface AnalyticsSummary {
  total: number
  open: number
  overdue: number
  resolvedToday: number
  slaCompliance: number
  byStatus: Record<RequestStatus, number>
  byPriority: Record<RequestPriority, number>
  agentLoad: Array<{ id: string; name: string; open: number; status: UserSummary['status'] }>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
