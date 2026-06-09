import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeLazyImages } from "./rehype-lazy-images";

async function render(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeLazyImages)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

describe("rehypeLazyImages", () => {
  it("adds loading=lazy and decoding=async to img tags", async () => {
    const html = await render("![alt text](/img.jpg)");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("does not affect non-img elements", async () => {
    const html = await render("# Hello\n\nA paragraph.");
    expect(html).not.toContain("loading");
    expect(html).not.toContain("decoding");
  });

  it("handles multiple images", async () => {
    const md = "![a](/a.jpg)\n\n![b](/b.jpg)\n\n![c](/c.jpg)";
    const html = await render(md);
    const imgCount = (html.match(/<img/g) || []).length;
    const lazyCount = (html.match(/loading="lazy"/g) || []).length;
    expect(imgCount).toBe(3);
    expect(lazyCount).toBe(3);
  });

  it("preserves existing alt and src attributes", async () => {
    const html = await render("![my alt text](/path/to/image.png)");
    expect(html).toContain('alt="my alt text"');
    expect(html).toContain('src="/path/to/image.png"');
  });
});
