ALTER TABLE request_events ADD COLUMN IF NOT EXISTS from_status request_status;
ALTER TABLE request_events ADD COLUMN IF NOT EXISTS to_status request_status;
