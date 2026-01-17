/**
 * init.js
 * Creates database tables (if missing) and seeds/updates the admin user hash.
 * Also performs lightweight migrations for new columns (SQLite).
 */
const db = require("./db");
const bcrypt = require("bcryptjs");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function columnExists(table, column) {
  const cols = await all(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

async function ensureColumn(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function init() {
  await run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,          -- "art" or "writing"
      media_type TEXT NOT NULL,    -- "image" | "video" | "audio" | "text" | "pdf"
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,          -- JSON string array
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      created_at TEXT NOT NULL

      -- New columns may be added by ALTER TABLE migrations below
    )
  `);

  // ✅ Migrations for per-writing-PDF background
  await ensureColumn("items", "background_color", "TEXT");
  await ensureColumn("items", "background_path", "TEXT");
  await ensureColumn("items", "background_name", "TEXT");
  await ensureColumn("items", "background_mime_type", "TEXT");

  await run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Seed or update admin
  const existing = await get(`SELECT * FROM admin_users WHERE email = ?`, [ADMIN_EMAIL]);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  if (!existing) {
    await run(
      `INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)`,
      [ADMIN_EMAIL, passwordHash, new Date().toISOString()]
    );
  } else {
    // Keep admin aligned to env (so you can reset password by changing .env)
    await run(`UPDATE admin_users SET password_hash = ? WHERE email = ?`, [passwordHash, ADMIN_EMAIL]);
  }
}

module.exports = { init };
