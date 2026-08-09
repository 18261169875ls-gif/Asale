import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("contains the Vercel-ready Asale AI sales workspace", async () => {
  const [page, demoData, layout, packageJson, navigation] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/components/global-nav.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /待回复客户/);
  assert.match(page, /今日重点客户/);
  assert.match(page, /Advisor 助手/);
  assert.match(page, /assistantName}下一步建议/);
  assert.match(page, /开始今日任务/);
  assert.match(page, /AI 回复模式/);
  assert.match(page, /可编辑话术/);
  assert.match(page, /列表已自动更新/);
  assert.match(page, /Agent 执行步骤/);
  assert.match(page, /读取最新消息/);
  assert.match(page, /判断意图与价值/);
  assert.match(page, /展示的是可验证的执行步骤与结果/);
  assert.match(navigation, /示例企业/);
  assert.match(page, /可信度/);
  assert.doesNotMatch(page, /插入输入框|结束本次处理|列表有更新/);
  assert.match(demoData, /新禾食品/);
  assert.match(layout, /Asale · 销售辅助系统/);
  assert.match(layout, /brand\/asale-icon\.png/);
  assert.match(packageJson, /"build": "next build"/);
  assert.match(packageJson, /"next": "16\.2\.6"/);
  assert.doesNotMatch(page, /codex-preview|SkeletonPreview/);
});

test("contains complete secondary workspace routes", async () => {
  const [customers, tasks, calendar, tools, search, profile, navigation, badges] = await Promise.all([
    readFile(new URL("../app/customers/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tasks/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/calendar/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tools/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/profile/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/global-nav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/status-badges.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(customers, /筛选客户|客户列表|进入消息工作台/);
  assert.match(tasks, /逾期任务|新建任务|AI 建议/);
  assert.match(calendar, /新建日程|客户预约|跟进提醒/);
  assert.match(tools, /商机看板|产品中心|知识库/);
  assert.match(search, /跨客户|知识与产品|最近搜索/);
  assert.match(profile, /销售画像|通知设置|AI 偏好|账号与权限/);
  assert.match(profile, /助手名称|asale-assistant-name/);
  assert.match(navigation, /\/customers|\/tasks|\/calendar|\/tools|\/profile|\/search/);
  assert.match(navigation, /brand\/asale-wordmark\.png|brand\/asale-icon\.png/);
  assert.match(badges, /wechat-unread-value|stage-prominent/);
  assert.match(badges, /99\+/);
});
