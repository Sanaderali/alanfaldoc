import { cleanRichHtml } from "@/lib/html";

/** Renders dashboard-written content. Sanitised again at render time as defence in depth. Pure server markup, zero client JS. */
export default function RichContent({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: cleanRichHtml(html) }} />;
}
