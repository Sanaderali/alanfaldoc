import "server-only";

export type Place = { country?: string; city?: string };

const isPrivate = (ip: string) => !ip || ip === "local" || /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd)/.test(ip);

/**
 * Where is the visitor? Order of attempts:
 *  1. Edge headers set by your host/CDN (Cloudflare cf-ipcountry, Vercel x-vercel-ip-*, etc.), free and instant.
 *  2. Optional lookup service: set GEOIP_URL to a URL containing {ip}, e.g. https://ipapi.co/{ip}/json/
 *     (response fields country_name / country and city are read). Disabled when the variable is empty.
 * If neither is available the location is simply "unknown".
 */
export async function locate(h: Headers, ip: string): Promise<Place> {
  const country = h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? h.get("x-appengine-country") ?? h.get("cloudfront-viewer-country") ?? undefined;
  const city = h.get("cf-ipcity") ?? h.get("x-vercel-ip-city") ?? h.get("x-appengine-city") ?? h.get("cloudfront-viewer-city") ?? undefined;
  if (country && country !== "XX") return { country, city: city ? decodeURIComponent(city) : undefined };

  const url = process.env.GEOIP_URL;
  if (url && !isPrivate(ip)) {
    try {
      const res = await fetch(url.replace("{ip}", encodeURIComponent(ip)), { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const d = (await res.json()) as Record<string, string>;
        return { country: d.country_name ?? d.country, city: d.city };
      }
    } catch {
      /* lookup failed: fall through */
    }
  }
  return {};
}
