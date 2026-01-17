/**
 * public.routes.js
 * Public read-only endpoints:
 * - GET /api/items?kind=art|writing&q=
 * - GET /api/items/:id
 */

const express = require("express");
const db = require("../db/db");

const router = express.Router();

function safeParseTags(tagsStr) {
  try {
    const val = JSON.parse(tagsStr || "[]");
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

function rowToItem(row) {
  return {
    id: row.id,
    kind: row.kind,
    mediaType: row.media_type,
    title: row.title,
    description: row.description,
    tags: safeParseTags(row.tags),
    fileUrl: `/uploads/${row.file_name}`, // ✅ URL, not filesystem path
    mimeType: row.mime_type,
    createdAt: row.created_at,

    // ✅ per-item background options (optional)
    backgroundColor: row.background_color || undefined,
    backgroundImageUrl: row.background_name ? `/uploads/${row.background_name}` : undefined
  };
}

router.get("/items", (req, res) => {
  const { kind, q } = req.query || {};
  const query = (q || "").toString().trim().toLowerCase();

  const where = [];
  const params = [];

  if (kind) {
    where.push("kind = ?");
    params.push(kind);
  }

  if (query) {
    where.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)");
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  db.all(`SELECT * FROM items ${whereSql} ORDER BY datetime(created_at) DESC`, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error." });
    res.json((rows || []).map(rowToItem));
  });
});

router.get("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error." });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(rowToItem(row));
  });
});

module.exports = router;
