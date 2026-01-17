/**
 * config.js
 * Centralized config loaded from environment variables.
 */
require("dotenv").config();

function parseCorsOrigins(value) {
  // Accept:
  // - single origin: "https://samportfolio.com"
  // - comma-separated: "http://localhost:5173,https://samportfolio.com"
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret_change_me",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "ChangeThisPassword123!",
  // Support multiple allowed origins for CORS
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN)
};
