import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} - ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share image (replaced per page if a page sets seo.image). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F8F9FA", color: "#1A1A1A" }}>
        <div style={{ fontSize: 30, color: "#D32F2F", fontWeight: 700, letterSpacing: 4 }}>DUBAI · UAE</div>
        <div style={{ fontSize: 86, fontWeight: 800, marginTop: 16 }}>{site.name}</div>
        <div style={{ fontSize: 40, marginTop: 20, color: "#0A5C36" }}>{site.tagline}</div>
      </div>
    ),
    size
  );
}
