/**
 * UploadForm.tsx
 * Admin upload form for adding art/writing items with file upload.
 * Adds optional per-item background (color + image) for detail pages.
 */
import React from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";
import { http, getToken } from "../../api/http";

export default function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [kind, setKind] = React.useState<"art" | "writing">("art");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  // ✅ NEW: background settings
  const [backgroundColor, setBackgroundColor] = React.useState("#07070a");
  const [backgroundFile, setBackgroundFile] = React.useState<File | null>(null);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) return setError("Please choose a file.");
    if (!title.trim() || !description.trim()) return setError("Title and description are required.");

    const token = getToken();
    if (!token) return setError("Not logged in.");

    const form = new FormData();
    form.append("kind", kind);
    form.append("title", title);
    form.append("description", description);
    form.append("tags", tags);

    // main media
    form.append("file", file);

    // ✅ optional background
    if (backgroundColor?.trim()) form.append("backgroundColor", backgroundColor.trim());
    if (backgroundFile) form.append("background", backgroundFile);

    try {
      setBusy(true);
      await http.postForm<{ id: number }>("/api/admin/items", form, token);

      setTitle("");
      setDescription("");
      setTags("");
      setFile(null);

      // keep background defaults so you can upload multiple items quickly
      // setBackgroundColor("#07070a");
      // setBackgroundFile(null);

      onUploaded();
    } catch (e: any) {
      setError(e?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Upload new work</h2>
        <div className="text-xs text-white/60">Admin-only</div>
      </div>

      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs text-white/70">
            Kind
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="art">Art (Gallery)</option>
              <option value="writing">Writing (Professional)</option>
            </select>
          </label>

          <label className="text-xs text-white/70">
            Tags (comma separated)
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="VR, editorial, collage..."
            />
          </label>
        </div>

        <label className="text-xs text-white/70">
          Title
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Piece title" />
        </label>

        <label className="text-xs text-white/70">
          Description (long)
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the full description / context / notes..."
            rows={6}
          />
        </label>

        <label className="text-xs text-white/70">
          File (image/video/audio/text/pdf)
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-widest file:text-white hover:file:bg-white/15"
          />
        </label>

        {/* ✅ NEW: background controls */}
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs text-white/70">
            Detail page background color
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-12 rounded-lg border border-white/12 bg-black/30 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#07070a"
              />
            </div>
            <div className="mt-1 text-[11px] text-white/50">
              Used when no background image is set (or as the base layer behind it).
            </div>
          </label>

          <label className="text-xs text-white/70">
            Optional background image (behind media)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-widest file:text-white hover:file:bg-white/15"
            />
            {backgroundFile ? (
              <div className="mt-1 text-[11px] text-white/50">
                Selected: <span className="text-white/70">{backgroundFile.name}</span>
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-white/50">No background image selected.</div>
            )}
          </label>
        </div>

        {error && <div className="text-sm text-red-300">{error}</div>}

        <Button type="submit" disabled={busy}>
          {busy ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </Card>
  );
}
