/**
 * admin.routes.js
 * Admin-only endpoints:
 * - POST /api/admin/items (multipart/form-data file upload)
 *
 * Supports optional per-item background:
 * - backgroundColor (string)
 * - background (file upload)
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db = require("../db/db");

// ✅ Robust import: supports BOTH `module.exports = requireAuth` and `module.exports = { requireAuth }`
const requireAuthModule = require("../middleware/requireAuth");
const requireAuth = requireAuthModule.requireAuth || requireAuthModule;

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir =
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

function sanitizeBaseName(name) {
  return name
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 80);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || "";
    const base = sanitizeBaseName(path.basename(file.originalname || "file", ext));
    const stamp = Date.now();
    const rand = Math.random().toString(16).slice(2);
    cb(null, `${stamp}_${rand}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

function detectMediaType(mime) {
  if (!mime) return "text";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("text/")) return "text";
  return "text";
}

function normalizeHexColor(input) {
  const s = (input || "").toString().trim();
  if (!s) return null;
  // allow "#000", "#000000", "000000"
  const raw = s.startsWith("#") ? s.slice(1) : s;
  if (!/^[0-9a-fA-F]{3}$/.test(raw) && !/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toLowerCase()}`;
}

// ✅ accept BOTH files in one request:
// - file (main media)
// - background (optional image)
router.post(
  "/items",
  requireAuth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "background", maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const { kind, title, description, tags, backgroundColor } = req.body || {};

      if (!kind || !title || !description) {
        return res.status(400).json({ error: "kind, title, description required." });
      }

      const files = req.files || {};
      const mainFile = files.file?.[0];
      const bgFile = files.background?.[0];

      if (!mainFile) {
        return res.status(400).json({ error: "File required." });
      }

      const mime = mainFile.mimetype || "application/octet-stream";
      const mediaType = detectMediaType(mime);

      const tagsArr = (tags || "")
        .toString()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const createdAt = new Date().toISOString();

      // ✅ main file
      const fileName = mainFile.filename; // only filename
      const filePath = `uploads/${fileName}`;

      // ✅ optional background
      const bgColor = normalizeHexColor(backgroundColor);
      const bgName = bgFile ? bgFile.filename : null;
      const bgPath = bgFile ? `uploads/${bgFile.filename}` : null;
      const bgMime = bgFile ? bgFile.mimetype : null;

      db.run(
        `
        INSERT INTO items
        (kind, media_type, title, description, tags, file_path, file_name, mime_type, created_at,
         background_color, background_path, background_name, background_mime_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?)
        `,
        [
          kind,
          mediaType,
          title,
          description,
          JSON.stringify(tagsArr),
          filePath,
          fileName,
          mime,
          createdAt,
          bgColor,
          bgPath,
          bgName,
          bgMime
        ],
        function (err) {
          if (err) {
            console.error("DB insert error:", err);
            return res.status(500).json({ error: "DB error." });
          }
          return res.json({ id: this.lastID });
        }
      );
    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      return res.status(500).json({ error: e?.message || "Upload failed." });
    }
  }
);
// DELETE /api/admin/items/:id
router.delete("/items/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  db.get(
    `SELECT file_name, background_name FROM items WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error("DB delete lookup error:", err);
        return res.status(500).json({ error: "DB error." });
      }
      if (!row) return res.status(404).json({ error: "Not found" });

      db.run(`DELETE FROM items WHERE id = ?`, [id], function (err2) {
        if (err2) {
          console.error("DB delete error:", err2);
          return res.status(500).json({ error: "DB error." });
        }

        // Best-effort file cleanup (don’t fail delete if unlink fails)
        const uploadsDir = process.env.UPLOADS_DIR || "/opt/render/project/src/uploads";

        const mainPath = row.file_name ? path.join(uploadsDir, row.file_name) : null;
        const bgPath = row.background_name ? path.join(uploadsDir, row.background_name) : null;

        for (const p of [mainPath, bgPath]) {
          if (!p) continue;
          fs.unlink(p, () => {}); // ignore errors
        }

        return res.json({ ok: true });
      });
    }
  );
});


module.exports = router;
