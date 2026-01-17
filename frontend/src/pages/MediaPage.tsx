/**
 * MediaPage.tsx
 * Social hub + embedded YouTube player area (podcast placeholder).
 *
 * Page-level background image only (no layout changes).
 */
import Card from "../components/ui/Card";

const socials = [
  { name: "YouTube", href: "https://www.youtube.com/" },
  { name: "Instagram", href: "https://www.instagram.com/" }
];

// 🔧 Change this if you rename the file
const MEDIA_BG_IMAGE = "/media/waves_green.png";

export default function MediaPage() {
  return (
    <div className="relative">
      {/* ===== FIXED PAGE BACKGROUND ===== */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${MEDIA_BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />

      {/* Optional dark overlay for readability */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.85))"
        }}
      />

      {/* ===== ORIGINAL PAGE CONTENT (UNCHANGED) ===== */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Media
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-white/60">
              Socials
            </div>
            <ul className="space-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.name}>
                  <a
                    className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-white/60">
              Podcast / Video
            </div>
            <p className="text-sm text-white/70">
              Replace the embed URL with your real channel/playlist once it exists.
            </p>

            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/videoseries?list=PL0000000000000000"
                title="Podcast player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
