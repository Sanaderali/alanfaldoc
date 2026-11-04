import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} - ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share image (replaced per page if a page sets seo.image). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#effcf5,#f3f4f6)", color: "#111827" }}>
        <div style={{ fontSize: 30, color: "#039a50", fontWeight: 700, letterSpacing: 4 }}>DUBAI · UAE</div>
        <div style={{ fontSize: 86, fontWeight: 800, marginTop: 16 }}>{site.name}</div>
        <div style={{ fontSize: 40, marginTop: 20, color: "#4b5563" }}>{site.tagline}</div>
      </div>
    ),
    size
  );
}
