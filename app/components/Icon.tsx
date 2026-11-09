import meta from "@/lib/icons-meta.json";

/**
 * Icon from the site's own SVG sprite (public/icons.<hash>.svg, built by `npm run icons` from Font Awesome Free).
 * No external script, stylesheet or font: nothing blocks the page and icons never shift the layout.
 * Pass a short name ("building") for solid icons, or a full class string ("fa-brands fa-facebook-f", "fa-regular fa-star").
 * Names that are not in the sprite show a neutral info icon. Run `npm run icons` after using a new name.
 */
const HAS = new Set<string>(meta.names);
const FALLBACK = "s-circle-info";

export const iconId = (name: string) => {
  const m = name.match(/fa-(solid|brands|regular) fa-([a-z0-9-]+)/);
  const id = m ? `${m[1] === "brands" ? "b" : m[1] === "regular" ? "r" : "s"}-${m[2]}` : `s-${name.trim().replace(/^fa-/, "")}`;
  return HAS.has(id) ? id : FALLBACK;
};

export default function Icon({ name, className = "", fixedWidth = true }: { name: string; className?: string; fixedWidth?: boolean }) {
  return (
    <svg className={`icon ${className}`} width={fixedWidth ? "1.25em" : "1em"} height="1em" aria-hidden="true" focusable="false">
      <use href={`/${meta.file}#${iconId(name)}`} />
    </svg>
  );
}
