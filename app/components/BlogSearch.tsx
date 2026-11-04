"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Item = { title: string; slug: string; category: string; excerpt: string };

/** Search box. Loads a tiny pre-built JSON index on first focus, so blog pages stay fully static. */
export default function BlogSearch() {
  const [q, setQ] = useState("");
  const index = useRef<Item[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const loading = useRef<Promise<void> | null>(null);
  const load = () => {
    loading.current ??= fetch("/blog/search-index.json")
      .then((r) => r.json())
      .then((d: Item[]) => { index.current = d; })
      .catch(() => { index.current = []; loading.current = null; });
    return loading.current;
  };
  const onChange = async (v: string) => {
    setQ(v);
    const term = v.trim().toLowerCase();
    if (!term) return setItems([]);
    await load(); // wait for the index if typing started before it arrived
    setItems((index.current ?? []).filter((i) => (i.title + i.excerpt + i.category).toLowerCase().includes(term)).slice(0, 5));
  };

  return (
    <div className="relative">
      <label htmlFor="blog-search" className="sr-only">Search articles</label>
      <input
        id="blog-search"
        type="search"
        value={q}
        placeholder="Search"
        autoComplete="off"
        onFocus={load}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-100 rounded text-ink placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {q.trim() && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden">
          {items.length ? items.map((i) => (
            <li key={i.slug}>
              <Link href={`/blog/${i.slug}`} className="block px-4 py-3 text-sm text-gray-700 hover:bg-canvas hover:text-brand-text">
                {i.title}<span className="block text-xs text-gray-400">{i.category}</span>
              </Link>
            </li>
          )) : <li className="px-4 py-3 text-sm text-gray-500">No articles found</li>}
        </ul>
      )}
    </div>
  );
}
