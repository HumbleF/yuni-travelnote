import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("declared dependencies", () => {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  it("unist-util-visit is declared as a direct dependency", () => {
    expect(pkg.dependencies).toBeDefined();
    expect(Object.keys(pkg.dependencies)).toContain("unist-util-visit");
  });

  it("unist-util-visit declared version is non-empty", () => {
    expect(pkg.dependencies["unist-util-visit"]).toBeTruthy();
  });
});
