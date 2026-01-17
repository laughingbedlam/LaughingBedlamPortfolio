/**
 * WritingDetailPage.tsx
 * Full writing view (markdown/pdf/text supported).
 */
import React from "react";
import { Link, useParams } from "react-router-dom";
import { http, toApiUrl } from "../api/http";
import { Item } from "../api/types";
import MediaRenderer from "../components/gallery/MediaRenderer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";
import Loader from "../components/ui/Loader";

export default function WritingDetailPage() {
  const { id } = useParams();
  const [item, setItem] = React.useState<Item | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setBusy(true);
        setError(null);
        const data = await http.get<Item>(`/api/items/${id}`);
        setItem(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load.");
      } finally {
        setBusy(false);
      }
    })();
  }, [id]);

  if (busy) return <Loader label="Loading writing..." />;
  if (error) return <div className="text-sm text-red-300">{error}</div>;
  if (!item) return null;

  const hasBg = Boolean(item.backgroundColor || item.backgroundImageUrl);
  const bgColor = item.backgroundColor ?? "#07070a";
  const bgImg = item.backgroundImageUrl ? `url(${toApiUrl(item.backgroundImageUrl)})` : undefined;

  return (
    <div className="relative">
      {/* ✅ Fixed background layer (stays put while scrolling PDF pages) */}
      {hasBg ? (
        <div
          aria-hidden
          className="fixed inset-0 -z-10"
          style={{
            backgroundColor: bgColor,
            backgroundImage: bgImg,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed"
          }}
        />
      ) : null}

      {/* ✅ Optional readability overlay if a background image exists */}
      {item.backgroundImageUrl ? (
        <div
          aria-hidden
          className="fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 30%, rgba(0,0,0,0.10), rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.85))"
          }}
        />
      ) : null}

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Writing</div>
            <h1 className="mt-1 text-2xl font-semibold text-white">{item.title}</h1>
          </div>
          <Link to="/pro/writing">
            <Button variant="ghost">← Back to library</Button>
          </Link>
        </div>

        <Card className="space-y-4 bg-white/[0.03]">
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <Tag key={t} text={t} />
            ))}
          </div>

          <div className="whitespace-pre-wrap text-sm text-white/70">{item.description}</div>

          <MediaRenderer item={item} />
        </Card>
      </div>
    </div>
  );
}
