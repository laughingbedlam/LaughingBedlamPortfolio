/**
 * mime.js
 * Small MIME/type helpers to map file types to supported media categories.
 */
const IMAGE_PREFIX = "image/";
const VIDEO_PREFIX = "video/";
const AUDIO_PREFIX = "audio/";

function mediaTypeFromMimetype(mime) {
  if (!mime) return "text";
  if (mime.startsWith(IMAGE_PREFIX)) return "image";
  if (mime.startsWith(VIDEO_PREFIX)) return "video";
  if (mime.startsWith(AUDIO_PREFIX)) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/")) return "text";
  // fallback
  return "text";
}

module.exports = { mediaTypeFromMimetype };
