CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK (role IN ('ADMIN','STUDENT'))
);
CREATE TABLE IF NOT EXISTS equipment (
 id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category TEXT NOT NULL,
 description TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('AVAILABLE','MAINTENANCE','RETIRED'))
);
CREATE TABLE IF NOT EXISTS reservations (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), equipment_id TEXT NOT NULL REFERENCES equipment(id),
 start BIGINT NOT NULL, "end" BIGINT NOT NULL, purpose TEXT NOT NULL,
 status TEXT NOT NULL CHECK (status IN ('REQUESTED','APPROVED','REJECTED','CANCELLED','CHECKED_OUT','RETURNED')),
 created_at BIGINT NOT NULL, returned_at BIGINT, late_minutes INTEGER NOT NULL DEFAULT 0,
 CHECK ("end" > start)
);
CREATE INDEX IF NOT EXISTS idx_reservations_equipment_window ON reservations(equipment_id,status,start,"end");
CREATE INDEX IF NOT EXISTS idx_reservations_user_status ON reservations(user_id,status);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),action TEXT NOT NULL,entity_id TEXT NOT NULL,created_at BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit(created_at);
