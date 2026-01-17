/**
 * GalleryPage.tsx
 * Public gallery listing of art items.
 */
import React from "react";
import { http } from "../api/http";
import { Item } from "../api/types";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";

export default function GalleryPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    try {
      setBusy(true);
      setError(null);
      const data = await http.get<Item[]>(`/api/items?kind=art&q=${encodeURIComponent(q)}`);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load.");
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Gallery</h1>
        </div>

        <div className="flex w-full max-w-md gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description..." />
          <button
            onClick={load}
            className="rounded-xl border border-white/12 bg-white/5 px-4 py-2 text-sm uppercase tracking-widest text-white hover:bg-white/10"
          >
            Search
          </button>
        </div>
      </div>

      {busy ? <Loader label="Loading gallery..." /> : null}
      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      {!busy && !error && <GalleryGrid items={items} />}
    </div>
  );
}
