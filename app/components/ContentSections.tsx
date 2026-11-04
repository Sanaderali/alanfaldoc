import type { ContentSection } from "@/types/content";

/** Renders the generic heading / paragraphs / bullet-list blocks from the data files. */
export default function ContentSections({ sections }: { sections: ContentSection[] }) {
  return (
    <>
      {sections.map((s, i) => {
        const H = s.minor ? "h3" : "h2";
        return (
          <div key={i} className="mb-8">
            <H className={s.minor ? "text-lg font-bold text-ink mb-3" : "text-2xl font-bold text-ink mb-4"}>{s.heading}</H>
            {s.paragraphs?.map((p, j) => (
              <p key={j} className="text-gray-600 leading-relaxed mb-4">{p}</p>
            ))}
            {s.list && (
              <ul className={`space-y-2 ${s.twoColumns ? "sm:columns-2 sm:gap-8" : ""}`}>
                {s.list.map((item, j) => (
                  <li key={j} className="flex items-start text-gray-700 break-inside-avoid">
                    <span className="text-brand-text mr-2" aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </>
  );
}
