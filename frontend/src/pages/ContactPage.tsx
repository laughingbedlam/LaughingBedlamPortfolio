/**
 * ContactPage.tsx
 * Simple contact page: big email + QR codes for Instagram + Discord.
 * No backend required.
 */
import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function QrBox({
  label,
  href,
  qrSrc
}: {
  label: string;
  href: string;
  qrSrc: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block"
      aria-label={label}
    >
      <Card className="h-full space-y-3 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]">
        <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
          <img
            src={qrSrc}
            alt={`${label} QR`}
            className="mx-auto block w-[220px] max-w-full select-none"
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/80 truncate">{href}</div>
          <div className="text-xs text-white/50 group-hover:text-white/70">Open →</div>
        </div>
      </Card>
    </a>
  );
}

export default function ContactPage() {
  // ✅ Edit these 3 values
  const email = "DimitriDHoffman@protonmail.ch";
  const instagramUrl = "https://instagram.com/YOUR_HANDLE";
  const discordInviteUrl = "https://discord.gg/YOUR_INVITE";

  // ✅ Put your generated QR pngs in /public/qr/
  const instagramQr = "/qr/instagram.png";
  const discordQr = "/qr/discord.png";

  const subject = encodeURIComponent("Work inquiry");
  const body = encodeURIComponent(
    "Hey — I found your portfolio and wanted to reach out about..."
  );
  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      alert("Email copied.");
    } catch {
      alert("Couldn’t copy. You can manually copy it.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-widest text-white/60">Contact</div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Contact the Artist
        </h1>
      </div>

      {/* Big email card */}
      <Card className="bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-white/60">Email</div>

            <a
              href={mailto}
              className="block text-2xl font-semibold text-white underline decoration-white/20 underline-offset-8 hover:decoration-white/60"
            >
              {email}
            </a>

          </div>

          <div className="flex gap-2">
            <Button onClick={copyEmail} variant="ghost">
              Copy
            </Button>
            <a href={mailto}>
              <Button>Compose</Button>
            </a>
          </div>
        </div>
      </Card>

      {/* QR section */}
      <div className="grid gap-4 md:grid-cols-2">
        <QrBox label="Instagram" href={instagramUrl} qrSrc={instagramQr} />
        <QrBox label="Discord" href={discordInviteUrl} qrSrc={discordQr} />
      </div>

    </div>
  );
}
