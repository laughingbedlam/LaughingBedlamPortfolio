/**
 * db.js
 * SQLite connection helper + schema init + optional admin seed.
 */
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "..", "..", "portfolio.sqlite");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB OPEN ERROR:", err);
  else console.log("SQLite DB:", dbPath);
});

db.serialize(() => {
  // Items table (you already need this)
  db.exec(`
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
  `);

  // Admin users table (required by auth.routes.js)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Optional: seed admin from env if not present
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    db.get(
      `SELECT id FROM admin_users WHERE email = ?`,
      [adminEmail],
      async (err, row) => {
        if (err) return console.error("ADMIN SEED CHECK ERROR:", err);
        if (row) return; // already seeded

        const hash = await bcrypt.hash(adminPassword, 10);
        db.run(
          `INSERT INTO admin_users (email, password_hash) VALUES (?, ?)`,
          [adminEmail, hash],
          (err2) => {
            if (err2) console.error("ADMIN SEED INSERT ERROR:", err2);
            else console.log("Seeded admin user:", adminEmail);
          }
        );
      }
    );
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin seed.");
  }
});

module.exports = db;
