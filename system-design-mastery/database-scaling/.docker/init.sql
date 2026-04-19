-- Schema ban đầu cho demo (EN: initial schema for the demo)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO users (email, name) VALUES
  ('a@example.com', 'Alice'),
  ('b@example.com', 'Bob')
ON CONFLICT DO NOTHING;
