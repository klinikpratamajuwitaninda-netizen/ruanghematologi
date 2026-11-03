-- Cloudflare D1 Schema Initialization for HEMATOLOGY WORLD
CREATE TABLE IF NOT EXISTS d1_kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
