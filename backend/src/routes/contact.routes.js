/**
 * contact.routes.js
 * Public endpoint to submit contact messages (stored in SQLite).
 */
const express = require("express");
const db = require("../db/db");

const router = express.Router();

// POST /api/contact { name, email?, phone?, message }
router.post("/", (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: "name and message required." });

  db.run(
    `INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)`,
    [name, email || "", phone || "", message, new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error." });
      return res.json({ ok: true, id: this.lastID });
    }
  );
});

module.exports = router;
