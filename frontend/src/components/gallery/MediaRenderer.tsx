/**
 * MediaRenderer.tsx
 * Renders an Item's media safely (image/video/audio/pdf/text).
 *
 * PDF: render inline with react-pdf, show ALL pages.
 * Uses local bundled worker from pdfjs-dist (no CDN).
 *
 * IMPORTANT:
 * We resolve file URLs defensively so we don't double-prefix the backend base URL.
 */
import React from "react";
import { Item } from "../../api/types";
import { toApiUrl } from "../../api/http";

import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// If you ever deploy, you can also make this come from env
// but for local dev this is fine as fallback.
const BACKEND_ORIGIN_FALLBACK = "http://localhost:4000";

/**
 * Converts item.fileUrl into a usable absolute URL.
 * Handles:
 *  - absolute:  http://localhost:4000/uploads/x.pdf  (leave as-is)
 *  - protocol-relative: //domain/...                  (convert to https:)
 *  - relative:  /uploads/x.pdf or uploads/x.pdf       (prefix backend)
 *  - API-relative: /api/...                           (toApiUrl)
 */
function resolveMediaUrl(fileUrl: string | undefined | null): string {
  const raw = String(fileUrl || "").trim();
  if (!raw) return "";

  // Already absolute (http/https)
  if (/^https?:\/\//i.test(raw)) return raw;

  // Protocol-relative
  if (/^\/\//.test(raw)) return `https:${raw}`;

  // If it's an /api/... path, use your helper (it knows backend base)
  if (raw.startsWith("/api/")) return toApiUrl(raw);

  // If it already looks like /uploads/..., prefix backend origin directly
  if (raw.startsWith("/uploads/")) return `${BACKEND_ORIGIN_FALLBACK}${raw}`;

  // If it looks like uploads/..., normalize to /uploads/...
  if (raw.startsWith("uploads/")) return `${BACKEND_ORIGIN_FALLBACK}/${raw}`;

  // Otherwise assume it's a relative path your API expects (e.g. "/uploads/...")
  // toApiUrl usually prefixes backend, but we guard against bad inputs.
  const maybe = toApiUrl(raw);

  // Safety: if toApiUrl accidentally returns something like "http://...http://..."
  // fall back to backend + raw.
  if (/^https?:\/\/.+https?:\/\//i.test(maybe)) {
    const normalized = raw.startsWith("/") ? raw : `/${raw}`;
    return `${BACKEND_ORIGIN_FALLBACK}${normalized}`;
  }

  return maybe;
}

export default function MediaRenderer({ item }: { item: Item }) {
  const src = resolveMediaUrl(item.fileUrl);

  // -------- PDF --------
  if (item.mediaType === "pdf") {
    return <InlinePdfViewer url={src} title={item.title} />;
  }

  // -------- IMAGE --------
  if (item.mediaType === "image") {
    return <InlineImage src={src} title={item.title} />;
  }

  // -------- VIDEO --------
  if (item.mediaType === "video") {
    return (
      <video
        src={src}
        controls
        className="w-full rounded-2xl border border-white/10 bg-black/20"
      />
    );
  }

  // -------- AUDIO --------
  if (item.mediaType === "audio") {
    return (
      <audio controls className="w-full">
        <source src={src} type={item.mimeType} />
      </audio>
    );
  }

  // -------- TEXT fallback --------
  if (item.mediaType === "text") {
    return (
      <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
        {item.description}
      </pre>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
      Unsupported media type.
    </div>
  );
}

function InlineImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = React.useState(false);

  if (!src) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Image URL missing.
      </div>
    );
  }

  return (
    <div className="w-full">
      {failed ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load image.
          <div className="mt-2 break-all text-xs text-red-200/70">{src}</div>
        </div>
      ) : null}

      <img
        src={src}
        alt={title}
        onError={() => setFailed(true)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 object-contain"
        loading="lazy"
      />
    </div>
  );
}

function InlinePdfViewer({ url, title }: { url: string; title: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = React.useState<number>(0);
  const [containerWidth, setContainerWidth] = React.useState<number>(900);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    function measure() {
      const w = containerRef.current?.clientWidth ?? 900;
      setContainerWidth(w);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (!url) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        PDF URL missing.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-white/60">PDF</div>
      </div>

      <div ref={containerRef} className="w-full">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            Failed to render PDF: {error}
            <div className="mt-2 break-all text-xs text-red-200/70">{url}</div>
          </div>
        ) : null}

        <Document
          // Using object form is more consistent for cross-origin cases
          file={{ url }}
          onLoadSuccess={(pdf) => {
            setNumPages(pdf.numPages);
            setError(null);
          }}
          onLoadError={(e: any) => setError(e?.message || "Failed to load PDF file.")}
          loading={<div className="py-10 text-center text-sm text-white/60">Loading PDF…</div>}
        >
          <div className="space-y-4">
            {Array.from({ length: numPages }, (_, idx) => (
              <div key={`${title}-page-${idx + 1}`} className="overflow-hidden rounded-xl bg-white">
                <Page
                  pageNumber={idx + 1}
                  width={Math.min(containerWidth, 1100)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </div>
        </Document>
      </div>
    </div>
  );
}
