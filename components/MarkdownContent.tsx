export function MarkdownContent({ html }: { html: string }) {
  return (
    <article
      className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
