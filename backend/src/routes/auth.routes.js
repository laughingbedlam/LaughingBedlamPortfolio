/**
 * auth.routes.js
 * Admin login endpoint returns JWT.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/db");
const { JWT_SECRET } = require("../config");

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  db.get(`SELECT * FROM admin_users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: "DB error." });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ sub: user.id, email: user.email, role: "admin" }, JWT_SECRET, {
      expiresIn: "7d"
    });

    return res.json({ token });
  });
});

module.exports = router;
