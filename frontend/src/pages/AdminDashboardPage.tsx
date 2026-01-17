/**
 * AdminDashboardPage.tsx
 * Owner dashboard: upload + search/filter + delete w/ confirmation.
 * UX upgrades:
 * - Search by title/description/tags
 * - Filter by kind (art/writing)
 * - Delete confirmation (prevents accidental deletes)
 * - Optional "Open" link to view item quickly
 */
import React from "react";
import UploadForm from "../components/admin/UploadForm";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";
import Tag from "../components/ui/Tag";
import { http, clearToken, getToken, toApiUrl } from "../api/http";
import { Item } from "../api/types";

type KindFilter = "all" | "art" | "writing";

export default function AdminDashboardPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // UX controls
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState<KindFilter>("all");
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  async function load() {
    try {
      setBusy(true);
      setError(null);
      const data = await http.get<Item[]>("/api/items");
      // newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(sorted);
    } catch (e: any) {
      setError(e?.message || "Failed to load items.");
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    const token = getToken();
    if (!token) return;

    const item = items.find((x) => x.id === id);
    const title = item?.title ? `"${item.title}"` : "this item";

    const ok = window.confirm(`Delete ${title}? This cannot be undone.`);
    if (!ok) return;

    try {
      setDeletingId(id);
      await http.delete<{ ok: boolean }>(`/api/admin/items/${id}`, token);
      await load();
    } catch (e: any) {
      setError(e?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  function logout() {
    clearToken();
    window.location.href = "/";
  }

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    return items.filter((i) => {
      if (kind !== "all" && i.kind !== kind) return false;

      if (!query) return true;

      const haystack = [
        i.title,
        i.description,
        ...(i.tags || []),
        i.mediaType,
        i.kind
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [items, q, kind]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/60">Owner</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Dashboard</h1>
          <div className="mt-1 text-sm text-white/60">
            Upload new work, or delete existing items.
          </div>
        </div>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Upload */}
      <UploadForm onUploaded={load} />

      {/* Manage */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">
              Manage items
            </h2>
            <div className="mt-1 text-xs text-white/55">
              Tip: search by title, description, or tag. Use filters to narrow down.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs uppercase tracking-widest text-white hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-xs text-white/70">
            Search
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, description, tags…"
            />
          </label>

          <div className="text-xs text-white/70">
            Type
            <div className="mt-1 flex gap-2">
              <FilterPill active={kind === "all"} onClick={() => setKind("all")} text="All" />
              <FilterPill active={kind === "art"} onClick={() => setKind("art")} text="Art" />
              <FilterPill
                active={kind === "writing"}
                onClick={() => setKind("writing")}
                text="Writing"
              />
            </div>
          </div>

          <div className="text-xs text-white/70">
            Count
            <div className="mt-2 text-sm text-white/65">
              Showing <span className="text-white">{filtered.length}</span> of{" "}
              <span className="text-white">{items.length}</span>
            </div>
          </div>
        </div>

        {busy ? <Loader label="Loading items..." /> : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        {!busy && !error && (
          <div className="grid gap-2">
            {filtered.map((i) => {
              const openHref =
                i.kind === "art" ? `/gallery/${i.id}` : `/professional/writing/${i.id}`;

              return (
                <div
                  key={i.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-white/60">
                      {i.kind.toUpperCase()} • {i.mediaType.toUpperCase()} •{" "}
                      {new Date(i.createdAt).toLocaleString()}
                    </div>

                    <div className="mt-1 truncate text-sm font-semibold text-white">{i.title}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(i.tags || []).slice(0, 6).map((t) => (
                        <Tag key={`${i.id}-${t}`} text={t} />
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-white/45">
                      File:{" "}
                      <a
                        href={toApiUrl(i.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white/70 underline underline-offset-2"
                      >
                        open upload
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={openHref}
                      className="rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs uppercase tracking-widest text-white hover:bg-white/10"
                    >
                      Open
                    </a>

                    <Button
                      variant="ghost"
                      onClick={() => remove(i.id)}
                      disabled={deletingId === i.id}
                    >
                      {deletingId === i.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  text
}: {
  active: boolean;
  onClick: () => void;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-2 text-[11px] uppercase tracking-widest transition",
        active
          ? "border-white/25 bg-white/10 text-white"
          : "border-white/12 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
      ].join(" ")}
      type="button"
    >
      {text}
    </button>
  );
}
