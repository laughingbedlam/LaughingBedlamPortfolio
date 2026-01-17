/**
 * fileValidation.js
 * Enforces allowed upload mimetypes and max file size.
 */
const MAX_MB = 60;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Allow: images, audio, video, pdf, and basic text formats
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
  "application/json"
]);

function isAllowedMime(mime) {
  if (!mime) return false;
  if (mime.startsWith("image/")) return true;
  if (mime.startsWith("video/")) return true;
  if (mime.startsWith("audio/")) return true;
  if (ALLOWED_MIME.has(mime)) return true;
  // Some browsers mark markdown as text/plain; we accept text/*
  if (mime.startsWith("text/")) return true;
  return false;
}

module.exports = { MAX_BYTES, isAllowedMime };
