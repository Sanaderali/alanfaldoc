import Icon from "./Icon";
import { site } from "@/data/site";
import type { Managed } from "@/types/content";

/**
 * Content blocks written for AI assistants + featured snippets:
 * a direct answer first, scannable takeaways, a facts table, clear authorship and sources.
 * Plain server markup with real headings (H2) so crawlers and LLMs can extract each block on its own.
 */

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

/** "Written by X · Last updated 4 November 2026" (trust signals) */
export function Byline({ author, updated, published, className = "" }: { author?: string; updated?: string; published?: string; className?: string }) {
  const who = author || site.defaultAuthor;
  const upd = updated ?? published;
  return (
    <p className={`text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <Icon name="user-pen" className="text-brand-text" />
      <span>Written by <a href="/about" rel="author" className="font-semibold text-ink hover:text-brand-text">{who}</a></span>
      {upd && <><span aria-hidden="true" className="text-gray-300">·</span><span>Last updated <time dateTime={upd}>{fmt(upd)}</time></span></>}
      {published && updated && published.slice(0, 10) !== updated.slice(0, 10) && <><span aria-hidden="true" className="text-gray-300">·</span><span>Published <time dateTime={published}>{fmt(published)}</time></span></>}
    </p>
  );
}

export function GeoBlock({ item, tableTitle = "At a glance" }: { item: Pick<Managed, "answer" | "takeaways" | "summaryTable">; tableTitle?: string }) {
  const { answer, takeaways, summaryTable } = item;
  if (!answer && !takeaways?.length && !summaryTable?.length) return null;
  return (
    <div className="space-y-6 mb-10">
      {answer && (
        <section aria-labelledby="quick-answer" className="geo-answer rounded-2xl border border-brand-200 bg-brand-50 border-l-4 border-l-brand px-5 py-4 sm:px-6 sm:py-5">
          <h2 id="quick-answer" className="text-sm font-bold uppercase tracking-wider text-brand-text mb-2">Quick answer</h2>
          <p className="text-[1.05rem] leading-relaxed text-ink">{answer}</p>
        </section>
      )}
      {takeaways && takeaways.length > 0 && (
        <section aria-labelledby="key-takeaways" className="rounded-2xl border border-gray-200/80 bg-white px-5 py-4 sm:px-6 sm:py-5 shadow-[0_2px_14px_rgba(15,23,42,.05)]">
          <h2 id="key-takeaways" className="text-xl font-bold text-ink mb-3">Key takeaways</h2>
          <ul className="space-y-2.5">
            {takeaways.map((t) => (
              <li key={t} className="flex items-start gap-3 text-gray-700"><Icon name="circle-check" className="text-brand mt-1 shrink-0" /><span>{t}</span></li>
            ))}
          </ul>
        </section>
      )}
      {summaryTable && summaryTable.length > 0 && (
        <section aria-labelledby="at-a-glance">
          <h2 id="at-a-glance" className="text-xl font-bold text-ink mb-3">{tableTitle}</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_14px_rgba(15,23,42,.05)]">
            <table className="w-full text-sm sm:text-base">
              <caption className="sr-only">{tableTitle}</caption>
              <tbody>
                {summaryTable.map((r, i) => (
                  <tr key={r.label} className={i % 2 ? "bg-white" : "bg-canvas"}>
                    <th scope="row" className="text-left font-semibold text-ink px-4 py-3 w-2/5 align-top">{r.label}</th>
                    <td className="px-4 py-3 text-gray-700">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export function Sources({ sources }: { sources?: { title: string; url: string }[] }) {
  if (!sources?.length) return null;
  return (
    <section aria-labelledby="sources" className="mt-10 pt-6 border-t border-gray-200">
      <h2 id="sources" className="text-xl font-bold text-ink mb-3">Sources &amp; references</h2>
      <ol className="list-decimal pl-5 space-y-1.5 text-sm text-gray-700">
        {sources.map((s) => (
          <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-text underline underline-offset-2 hover:text-brand-dark">{s.title}</a> <span className="text-gray-400 break-all">({s.url.replace(/^https?:\/\//, "").split("/")[0]})</span></li>
        ))}
      </ol>
    </section>
  );
}
