/**
 * Footer.tsx
 * Footer with image-backed background (layout unchanged).
 */
import { Link } from "react-router-dom";

// 🔧 Change this path if you rename the image
const FOOTER_BG_IMAGE = "/media/maces_grey.png";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/10"
      style={{
        backgroundImage: `url(${FOOTER_BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Subtle dark overlay for readability */}
      <div className="bg-black/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div>© noemiamahmud.com — contact for custom webpages</div>

          <div className="flex items-center gap-4">
            <div className="font-mono">Laughing Bedlam</div>

            <Link
              to="/admin/login"
              className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white/70"
            >
              Owner Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
