import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PLACES_DIR = path.join(process.cwd(), "content", "places");

function readAllFrontmatter() {
  return fs
    .readdirSync(PLACES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(PLACES_DIR, file), "utf-8");
      const { data } = matter(raw);
      return { file, data };
    });
}

describe("content frontmatter integrity", () => {
  const entries = readAllFrontmatter();

  it("every place with a country declares countryEn", () => {
    for (const { file, data } of entries) {
      if (data.country) {
        expect(
          data.countryEn,
          `${file} declares country but is missing countryEn`,
        ).toBeTruthy();
      }
    }
  });

  it("every place with a region declares regionEn", () => {
    for (const { file, data } of entries) {
      if (data.region) {
        expect(
          data.regionEn,
          `${file} declares region but is missing regionEn`,
        ).toBeTruthy();
      }
    }
  });
});
