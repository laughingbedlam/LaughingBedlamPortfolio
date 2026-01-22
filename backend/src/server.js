/**
 * server.js
 * Express app bootstrap.
 * - Serves /uploads as a static directory
 * - Mounts routes
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT = 4000 } = require("./config");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

app.use(express.json({ limit: "10mb" }));

// Dev-friendly CORS (you can tighten later)
// CORS (prod + local)
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (curl/postman) with no Origin header
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.options("*", cors());


// ---- Serve uploads as static files ----
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use(
  "/uploads",
  express.static(uploadsDir, {
    fallthrough: false, // if not found -> error handler
    setHeaders(res) {
      // Useful for PDFs being rendered by pdf.js
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api", contactRoutes);

// ---- Error handler (so /uploads missing file isn’t a silent crash) ----
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
