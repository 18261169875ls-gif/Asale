import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("contains the Vercel-ready Asale AI sales workspace", async () => {
  const [page, demoData, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /待回复客户/);
  assert.match(page, /今日重点客户/);
  assert.match(page, /Advisor 下一步建议/);
  assert.match(page, /开始今日任务/);
  assert.match(page, /示例企业/);
  assert.match(page, /可信度/);
  assert.match(demoData, /新禾食品/);
  assert.match(layout, /Asale · 销售辅助系统/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(packageJson, /"next": "16\.2\.6"/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});
