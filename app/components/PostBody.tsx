/** Renders Post.body: "## " = heading, "- a\n- b" = bullet list, otherwise a paragraph. */
export default function PostBody({ body }: { body: string[] }) {
  return (
    <div className="text-gray-700 leading-relaxed">
      {body.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-ink mt-8 mb-3">{b.slice(3)}</h2>;
        if (b.startsWith("- ")) {
          return (
            <ul key={i} className="space-y-2 my-4">
              {b.split("\n").map((l, j) => (
                <li key={j} className="flex items-start"><span className="text-brand-text mr-2" aria-hidden="true">•</span><span>{l.replace(/^-\s*/, "")}</span></li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="mb-5">{b}</p>;
      })}
    </div>
  );
}
