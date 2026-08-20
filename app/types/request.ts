export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'waiting' | 'resolved' | 'closed' | 'escalated'
export type RequestPriority = 'critical' | 'high' | 'normal' | 'low'

export interface RequestComment {
  id: string
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
  kind: 'created' | 'status' | 'comment' | 'assignment'
}

export interface ServiceRequest {
  id: string
  title: string
  description: string
  status: RequestStatus
  priority: RequestPriority
  customer: string
  customerCompany: string
  assignee: string | null
  category: string
  createdAt: string
  updatedAt: string
  slaDueAt: string
  comments: RequestComment[]
  timeline: RequestEvent[]
}
