import Link from 'next/link';
import { SMART_TOOL_CATEGORIES } from '@/lib/tools/categories';

/** 404 for an unknown tool or a tool filed under the wrong category. */
export default function SmartToolNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center" dir="ltr">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-black text-white">Tool not found</h1>
      <p className="mt-3 text-sm text-zinc-400">
        This tool does not exist, or it is not published under this category.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/smarttools"
          className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-lime-400"
        >
          All Smart Tools
        </Link>
        {SMART_TOOL_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/smarttools/${c.slug}`}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-lime-500 hover:text-lime-400"
          >
            {c.nameEn}
          </Link>
        ))}
      </div>
    </div>
  );
}
