import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'database.sqlite');

// Open the database
const db = new Database(dbPath, { verbose: console.log });

// Create the tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    max_requests INTEGER NOT NULL DEFAULT 10,
    used_requests INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invitation_id INTEGER,
    input_text TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(invitation_id) REFERENCES invitations(id)
  );
`);

// Migration: add invitation_id if it doesn't exist in older databases
try {
  const columns = db.pragma('table_info(analyses)');
  const hasInvitationId = columns.some(col => col.name === 'invitation_id');
  if (!hasInvitationId) {
    db.exec('ALTER TABLE analyses ADD COLUMN invitation_id INTEGER REFERENCES invitations(id);');
  }
} catch (e) {
  // Ignore migration errors
  console.log('Migration note:', e.message);
}

export default db;
