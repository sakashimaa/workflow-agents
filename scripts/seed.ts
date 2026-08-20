import { hash } from 'bcryptjs'
import postgres from 'postgres'
import { demoCategories, demoCustomers, demoRequests, demoUsers } from '../shared/fixtures/demo-data'

const databaseUrl = process.env.NUXT_DATABASE_URL
if (!databaseUrl) throw new Error('NUXT_DATABASE_URL is required')
const sql = postgres(databaseUrl, { max: 1 })
const passwordHash = await hash('Demo1234!', 12)

try {
  await sql.begin(async transaction => {
    for (const customer of demoCustomers) {
      await transaction`INSERT INTO customers (id, name, email, phone, company, created_at) VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.phone}, ${customer.company}, ${customer.createdAt}) ON CONFLICT (id) DO UPDATE SET name = excluded.name, email = excluded.email, phone = excluded.phone, company = excluded.company`
    }
    for (const user of demoUsers) {
      await transaction`INSERT INTO users (id, name, email, password_hash, role, status, customer_id) VALUES (${user.id}, ${user.name}, ${user.email}, ${passwordHash}, ${user.role}, ${user.status}, ${user.customerId}) ON CONFLICT (id) DO UPDATE SET name = excluded.name, email = excluded.email, password_hash = excluded.password_hash, role = excluded.role, status = excluded.status, customer_id = excluded.customer_id`
    }
    for (const category of demoCategories) {
      await transaction`INSERT INTO categories (id, name, description, is_active) VALUES (${category.id}, ${category.name}, ${category.description}, ${category.isActive}) ON CONFLICT (id) DO UPDATE SET name = excluded.name, description = excluded.description, is_active = excluded.is_active`
    }
    const policies = [['critical', 15, 60], ['high', 60, 240], ['normal', 240, 1440], ['low', 480, 4320]] as const
    for (const [priority, responseMinutes, resolutionMinutes] of policies) {
      await transaction`INSERT INTO sla_policies (priority, response_minutes, resolution_minutes) VALUES (${priority}, ${responseMinutes}, ${resolutionMinutes}) ON CONFLICT (priority) DO UPDATE SET response_minutes = excluded.response_minutes, resolution_minutes = excluded.resolution_minutes, updated_at = now()`
    }
    for (const request of demoRequests) {
      await transaction`INSERT INTO requests (id, title, description, status, priority, customer_id, assignee_id, category_id, sla_due_at, created_at, updated_at, closed_at, archived, version) VALUES (${request.id}, ${request.title}, ${request.description}, ${request.status}, ${request.priority}, ${request.customerId}, ${request.assigneeId}, ${request.categoryId}, ${request.slaDueAt}, ${request.createdAt}, ${request.updatedAt}, ${request.closedAt}, ${request.archived}, ${request.version}) ON CONFLICT (id) DO UPDATE SET title = excluded.title, description = excluded.description, status = excluded.status, priority = excluded.priority, customer_id = excluded.customer_id, assignee_id = excluded.assignee_id, category_id = excluded.category_id, sla_due_at = excluded.sla_due_at, updated_at = excluded.updated_at, closed_at = excluded.closed_at, archived = excluded.archived, version = excluded.version`
      for (const comment of request.comments) {
        await transaction`INSERT INTO comments (id, request_id, author_id, body, created_at) VALUES (${comment.id}, ${comment.requestId}, ${comment.authorId}, ${comment.body}, ${comment.createdAt}) ON CONFLICT (id) DO NOTHING`
      }
      for (const event of request.timeline) {
        await transaction`INSERT INTO request_events (id, request_id, actor_id, kind, title, detail, created_at) VALUES (${event.id}, ${request.id}, ${null}, ${event.kind}, ${event.title}, ${event.detail}, ${event.createdAt}) ON CONFLICT (id) DO NOTHING`
      }
    }
  })
  console.log('Demo data seeded. Password for all demo accounts: Demo1234!')
} finally {
  await sql.end()
}
