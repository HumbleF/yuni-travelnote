import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <div className="rounded-2xl border border-dashed border-card p-12">
        <p className="text-5xl">🗺️</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          页面未找到
        </h1>
        <p className="mt-2 text-muted">
          这个地方还没有被收录，或者链接已失效。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <span aria-hidden>←</span> 返回首页
        </Link>
      </div>
    </div>
  );
}
