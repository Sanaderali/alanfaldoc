import { flagSrc } from "@/lib/flags";

/** Country flag. Uses the uploaded image or a built-in flag; falls back to the emoji only when neither exists. */
export default function Flag({ country, className = "", size = 40 }: { country: { flagImage?: string; flag?: string; name?: string }; className?: string; size?: number }) {
  const src = flagSrc(country);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={Math.round(size * 0.75)} loading="lazy" decoding="async" className={`inline-block rounded-sm shadow-sm object-cover ${className}`} style={{ width: size, height: "auto", aspectRatio: "4 / 3" }} />;
  }
  return <span aria-hidden="true" className={className}>{country.flag}</span>;
}
