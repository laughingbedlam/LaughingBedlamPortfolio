/**
 * types.ts
 * Shared API types for items and contact payloads.
 */
export type ItemKind = "art" | "writing";
export type MediaType = "image" | "video" | "audio" | "text" | "pdf";

export type Item = {
  id: number;
  kind: ItemKind;
  mediaType: MediaType;
  title: string;
  description: string;
  tags: string[];
  fileUrl: string; // served by backend
  mimeType: string;
  createdAt: string;

  // ✅ Per-item (writing PDF) background options (optional)
  backgroundImageUrl?: string; // e.g. "/uploads/....png"
  backgroundColor?: string;    // e.g. "#07070a"
};

export type LoginResponse = { token: string };

export type ContactPayload = {
  name: string;
  email?: string;
  phone?: string;
  message: string;
};
