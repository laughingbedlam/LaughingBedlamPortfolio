import { Link } from "react-router-dom";
import { Item } from "../../api/types";
import Tag from "../ui/Tag";
import { toApiUrl } from "../../api/http";

export default function GalleryItemCard({ item }: { item: Item }) {
  return (
    <Link
      to={`/gallery/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:border-white/20 hover:bg-white/5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        <TilePreview item={item} />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-white">{item.title}</h3>
          <span className="text-[11px] font-mono text-white/50">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-white/65">{item.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((t) => (
            <Tag key={t} text={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}

function TilePreview({ item }: { item: Item }) {
  const src = toApiUrl(item.fileUrl);

  if (item.mediaType === "image") {
    return (
      <img
        src={src}
        alt={item.title}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] group-hover:opacity-95"
        loading="lazy"
        onError={() => console.error("Gallery thumbnail failed to load:", src)}
      />
    );
  }

  if (item.mediaType === "video") {
    return <video src={src} muted playsInline preload="metadata" className="h-full w-full object-cover opacity-90" />;
  }

  const label =
    item.mediaType === "audio" ? "AUDIO" : item.mediaType === "pdf" ? "PDF" : "TEXT";

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-xs font-mono tracking-widest text-white/70">
        {label}
      </div>
    </div>
  );
}
