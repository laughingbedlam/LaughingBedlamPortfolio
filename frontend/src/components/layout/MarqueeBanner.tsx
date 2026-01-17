/**
 * MarqueeBanner.tsx
 * A continuous scrolling text banner. Edit the text prop in LandingPage to change content.
 */
import React from "react";

export default function MarqueeBanner({
  text = "LAUGHING BEDLAM — ARCHIVE IN MOTION — LAUGHING BEDLAM — ARCHIVE IN MOTION —",
  speedSeconds = 18
}: {
  text?: string;
  speedSeconds?: number;
}) {
  // Duplicate text chunks to ensure seamless looping
  const chunk = `${text} \u00A0 \u00A0 \u00A0 `;
  const repeated = new Array(10).fill(chunk).join("");

  return (
    <div className="marquee-wrap">
      <div
        className="marquee-track"
        style={{ ["--marquee-duration" as any]: `${speedSeconds}s` }}
        aria-label="Site banner marquee"
      >
        <span className="marquee-text">{repeated}</span>
        <span className="marquee-text" aria-hidden="true">
          {repeated}
        </span>
      </div>
    </div>
  );
}
