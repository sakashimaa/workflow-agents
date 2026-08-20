import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['client', 'operator', 'agent', 'admin'])
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive'])
export const requestStatusEnum = pgEnum('request_status', ['new', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed', 'escalated'])
export const requestPriorityEnum = pgEnum('request_priority', ['critical', 'high', 'normal', 'low'])

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  company: text('company').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [uniqueIndex('customers_email_unique').on(table.email)])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  status: userStatusEnum('status').notNull().default('active'),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [uniqueIndex('users_email_unique').on(table.email), index('users_customer_idx').on(table.customerId)])

export const sessions = pgTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('sessions_user_idx').on(table.userId), index('sessions_expiry_idx').on(table.expiresAt)])

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
}, table => [uniqueIndex('categories_name_unique').on(table.name)])

export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: requestStatusEnum('status').notNull().default('new'),
  priority: requestPriorityEnum('priority').notNull().default('normal'),
  customerId: text('customer_id').notNull().references(() => customers.id),
  assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  categoryId: text('category_id').notNull().references(() => categories.id),
  resolution: text('resolution'),
  waitingReason: text('waiting_reason'),
  escalationReason: text('escalation_reason'),
  slaDueAt: timestamp('sla_due_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  archived: boolean('archived').notNull().default(false),
  version: integer('version').notNull().default(1),
}, table => [
  index('requests_status_idx').on(table.status),
  index('requests_priority_idx').on(table.priority),
  index('requests_customer_idx').on(table.customerId),
  index('requests_assignee_idx').on(table.assigneeId),
  index('requests_sla_idx').on(table.slaDueAt),
])

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => requests.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('comments_request_idx').on(table.requestId)])

export const requestEvents = pgTable('request_events', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => requests.id, { onDelete: 'cascade' }),
  actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  detail: text('detail').notNull(),
  fromStatus: requestStatusEnum('from_status'),
  toStatus: requestStatusEnum('to_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('request_events_request_idx').on(table.requestId)])

export const attachments = pgTable('attachments', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => requests.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('attachments_request_idx').on(table.requestId)])

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [index('notifications_user_idx').on(table.userId, table.readAt)])

export const slaPolicies = pgTable('sla_policies', {
  priority: requestPriorityEnum('priority').primaryKey(),
  responseMinutes: integer('response_minutes').notNull(),
  resolutionMinutes: integer('resolution_minutes').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
