import { demoCategories, demoCustomers, demoRequests, demoUsers } from '#shared/fixtures/demo-data'

export const demoStore = {
  requests: structuredClone(demoRequests),
  users: structuredClone(demoUsers),
  customers: structuredClone(demoCustomers),
  categories: structuredClone(demoCategories),
}
