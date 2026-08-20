import { demoCategories, demoCustomers, demoNotifications, demoRequests, demoSlaPolicies, demoUsers } from '#shared/fixtures/demo-data'
import type { AttachmentSummary } from '#shared/types/domain'

export const demoStore = {
  requests: structuredClone(demoRequests),
  users: structuredClone(demoUsers),
  customers: structuredClone(demoCustomers),
  categories: structuredClone(demoCategories),
  slaPolicies: structuredClone(demoSlaPolicies),
  notifications: structuredClone(demoNotifications),
  attachments: [] as AttachmentSummary[],
}
