import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("contains the Vercel-ready Asale sales workspace", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /待回复客户/);
  assert.match(page, /选择客户后查看画像/);
  assert.match(page, /示例企业/);
  assert.match(page, /可信度/);
  assert.match(layout, /Asale · 销售辅助系统/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(packageJson, /"next": "16\.2\.6"/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});
