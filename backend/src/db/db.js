/**
 * db.js
 * SQLite connection helper (single shared connection).
 */
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "..", "portfolio.sqlite");
const db = new sqlite3.Database(dbPath);

module.exports = db;
