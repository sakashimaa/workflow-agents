DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'operator', 'agent', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('new', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE request_priority AS ENUM ('critical', 'high', 'normal', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  company text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  customer_id text REFERENCES customers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

CREATE SEQUENCE IF NOT EXISTS request_number_seq START 1043;
CREATE TABLE IF NOT EXISTS requests (
  id text PRIMARY KEY DEFAULT ('REQ-' || nextval('request_number_seq')),
  title text NOT NULL,
  description text NOT NULL,
  status request_status NOT NULL DEFAULT 'new',
  priority request_priority NOT NULL DEFAULT 'normal',
  customer_id text NOT NULL REFERENCES customers(id),
  assignee_id text REFERENCES users(id) ON DELETE SET NULL,
  category_id text NOT NULL REFERENCES categories(id),
  resolution text,
  waiting_reason text,
  escalation_reason text,
  sla_due_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  archived boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES users(id),
  body text NOT NULL CHECK (length(btrim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS request_events (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  actor_id text REFERENCES users(id) ON DELETE SET NULL,
  kind text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attachments (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL CHECK (size > 0),
  url text NOT NULL,
  uploaded_by text NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sla_policies (
  priority request_priority PRIMARY KEY,
  response_minutes integer NOT NULL CHECK (response_minutes > 0),
  resolution_minutes integer NOT NULL CHECK (resolution_minutes > 0),
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_customer_idx ON users(customer_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS requests_status_idx ON requests(status);
CREATE INDEX IF NOT EXISTS requests_priority_idx ON requests(priority);
CREATE INDEX IF NOT EXISTS requests_customer_idx ON requests(customer_id);
CREATE INDEX IF NOT EXISTS requests_assignee_idx ON requests(assignee_id);
CREATE INDEX IF NOT EXISTS requests_sla_idx ON requests(sla_due_at);
CREATE INDEX IF NOT EXISTS comments_request_idx ON comments(request_id);
CREATE INDEX IF NOT EXISTS request_events_request_idx ON request_events(request_id);
CREATE INDEX IF NOT EXISTS attachments_request_idx ON attachments(request_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, read_at);
