/**
 * Font Awesome icon (Free kit, loaded once in app/layout.tsx).
 * Pass a short name ("building") for solid icons, or a full class string
 * ("fa-brands fa-facebook-f") for brands / regular styles.
 * Browse names: https://fontawesome.com/search?o=r&m=free
 */
export default function Icon({ name, className = "", fixedWidth = true }: { name: string; className?: string; fixedWidth?: boolean }) {
  const cls = name.includes(" ") ? name : `fa-solid fa-${name}`;
  return <i className={`${cls} ${fixedWidth ? "fa-fw" : ""} ${className}`} style={fixedWidth ? { display: "inline-block", width: "1.25em", textAlign: "center" } : undefined} aria-hidden="true" />;
}
