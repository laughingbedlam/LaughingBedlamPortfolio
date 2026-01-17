/**
 * LandingPage.tsx
 * Homepage: marquee + hero + recent art + brand message + embedded media.
 * Purely stylistic changes; functionality preserved.
 */
import React from "react";
import { Link } from "react-router-dom";
import MarqueeBanner from "../components/layout/MarqueeBanner";
import GalleryItemCard from "../components/gallery/GalleryItemCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { http } from "../api/http";
import { Item } from "../api/types";

const ARTIST_MESSAGE =
  "insert artist message here — short brand line, vibe statement, or manifesto fragment.";

const BRAND_MESSAGE = {
  title: "Laughing Bedlam",
  body:
    "A living archive of work—collage, fragments, experiments, and clean(er) words when needed. " +
    "Built to hold the past and keep moving forward."
};

const YOUTUBE_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0"; // placeholder — replace later

export default function LandingPage() {
  const [recentArt, setRecentArt] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const items = await http.get<Item[]>("/api/items");

        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Fix: use `kind` (not category). Show newest 4 art pieces.
        setRecentArt(sorted.filter((i) => i.kind === "art").slice(0, 4));
      } catch {
        setRecentArt([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <MarqueeBanner
        text="LAUGHING BEDLAM — NEW WORK ADDED REGULARLY — CONTACT FOR CUSTOM WEBPAGES —"
        speedSeconds={18}
      />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="landing-hero landing-hero--single">
          <div className="landing-hero__left">
            <div className="text-xs font-mono tracking-[0.22em] text-white/55">
              PORTFOLIO // ARCHIVE
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Laughing Bedlam
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">{ARTIST_MESSAGE}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/gallery">
                <Button>View Gallery</Button>
              </Link>

              {/* Fix: no "secondary" variant exists — use allowed variants */}
              <Link to="/professional">
                <Button variant="pro">Professional Writing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ART */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono tracking-[0.22em] text-white/55">ART</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Recent work</h2>
          </div>

          {/* Fix: should be a button */}
          <Link to="/gallery">
            <Button variant="ghost">View gallery →</Button>
          </Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : recentArt.length === 0 ? (
            <div className="text-sm text-white/60">
              No art uploaded yet. Log in as owner to add work.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {recentArt.map((item) => (
                <GalleryItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BRAND MESSAGE */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <Card className="landing-message">
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {BRAND_MESSAGE.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            {BRAND_MESSAGE.body}
          </p>
        </Card>
      </section>

      {/* MEDIA EMBED */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Link to="/media" className="inline-block">
              <div className="text-xs font-mono tracking-[0.22em] text-white/55">MEDIA</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white hover:underline">
                Watch / listen →
              </h2>
            </Link>
            <p className="mt-2 text-sm text-white/65">
            Channel Coming Soon.
            </p>
          </div>
          <Link to="/media" className="text-sm text-white/70 hover:text-white">
            Open media page →
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src={YOUTUBE_EMBED_URL}
              title="YouTube player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
}
