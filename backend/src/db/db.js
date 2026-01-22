/**
 * db.js
 * SQLite connection helper (single shared connection) + schema init.
 */
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Prefer an explicit DB_PATH in production (Render disk), else fall back.
const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "..", "portfolio.sqlite");

// Ensure the directory exists (important if DB_PATH points to a mounted disk folder)
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB OPEN ERROR:", err);
  else console.log("SQLite DB:", dbPath);
});

// Create schema if missing
db.serialize(() => {
  db.exec(
    `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      media_type TEXT,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT DEFAULT '[]',
      file_name TEXT,
      mime_type TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      background_color TEXT,
      background_name TEXT
    );
    `,
    (err) => {
      if (err) console.error("DB SCHEMA ERROR:", err);
      else console.log("DB schema ready (items)");
    }
  );
});

module.exports = db;
