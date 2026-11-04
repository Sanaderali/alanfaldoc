import Link from "next/link";
import Icon from "./Icon";

const href = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`);

export default function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const box = "w-10 h-10 flex items-center justify-center rounded border text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="Previous page" rel="prev" className={`${box} border-gray-200 text-gray-600 hover:border-[#ff5722] hover:text-[#ff5722]`}><Icon name="arrow-left" /></Link>
      ) : <span aria-hidden="true" className={`${box} border-gray-100 text-gray-300`}><Icon name="arrow-left" /></span>}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={`${box} ${n === page ? "bg-[#ff5722] border-[#ff5722] text-white shadow" : "border-gray-200 text-gray-600 hover:border-[#ff5722] hover:text-[#ff5722]"}`}>{n}</Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} aria-label="Next page" rel="next" className={`${box} border-gray-200 text-gray-600 hover:border-[#ff5722] hover:text-[#ff5722]`}><Icon name="arrow-right" /></Link>
      ) : <span aria-hidden="true" className={`${box} border-gray-100 text-gray-300`}><Icon name="arrow-right" /></span>}
    </nav>
  );
}
