/** Re-mounted on every navigation, so each page fades/slides in smoothly. CSS only, no JS. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
