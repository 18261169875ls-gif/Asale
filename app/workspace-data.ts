export type TaskStatus = "逾期" | "今天" | "未来" | "已完成";

export type SalesTask = {
  id: string;
  title: string;
  customer: string;
  due: string;
  status: TaskStatus;
  priority: "高" | "中" | "低";
  source: "AI 建议" | "手动创建";
};

export const initialTasks: SalesTask[] = [
  { id: "t1", title: "确认定制茶基底预计用量", customer: "新禾食品", due: "今天 10:30", status: "今天", priority: "高", source: "AI 建议" },
  { id: "t2", title: "补充抹茶粉规格与交付周期", customer: "山岚茶饮", due: "今天 14:00", status: "今天", priority: "高", source: "AI 建议" },
  { id: "t3", title: "回访样品常温稳定性", customer: "清原饮品", due: "昨天 17:00", status: "逾期", priority: "高", source: "手动创建" },
  { id: "t4", title: "发送最新产品目录", customer: "云栖食品", due: "明天 09:30", status: "未来", priority: "中", source: "AI 建议" },
  { id: "t5", title: "整理贸易渠道适配产品", customer: "远川贸易", due: "周五 15:00", status: "未来", priority: "低", source: "手动创建" },
  { id: "t6", title: "完成上周重点客户复盘", customer: "个人任务", due: "昨天 18:00", status: "已完成", priority: "中", source: "手动创建" },
];

export const scheduleItems = [
  { id: "s1", time: "09:30", title: "新禾食品方案确认会", type: "客户会议", customer: "新禾食品", date: "今天", location: "企业微信会议" },
  { id: "s2", time: "11:00", title: "重点客户跟进复盘", type: "跟进提醒", customer: "山岚茶饮", date: "今天", location: "Asale" },
  { id: "s3", time: "14:30", title: "清原饮品样品反馈", type: "客户预约", customer: "清原饮品", date: "今天", location: "电话沟通" },
  { id: "s4", time: "10:00", title: "产品知识内部培训", type: "会议", customer: "内部", date: "明天", location: "会议室 B" },
];

export const productItems = [
  { name: "茶基底解决方案", category: "茶饮原料", description: "覆盖定制茶基底、风味适配与应用支持", count: "12 个方案" },
  { name: "抹茶粉系列", category: "粉体产品", description: "不同细度、色泽和风味等级的产品组合", count: "8 个规格" },
  { name: "茶浓缩液", category: "液体产品", description: "适用于即饮茶、乳茶与食品应用", count: "6 个规格" },
];

export const knowledgeItems = [
  { title: "定制茶基底销售话术", type: "销售话术", updated: "今天更新", uses: 28 },
  { title: "新式茶饮行业客户案例", type: "客户案例", updated: "昨天更新", uses: 17 },
  { title: "抹茶粉常见问题与规格说明", type: "常见问题", updated: "3 天前", uses: 42 },
  { title: "客户意向与价值判断规范", type: "公司制度", updated: "5 天前", uses: 31 },
];

export const opportunityItems = [
  { name: "新禾食品年度茶基底采购", customer: "新禾食品", stage: "方案沟通", amount: "¥320,000", probability: 75 },
  { name: "山岚茶饮抹茶粉采购", customer: "山岚茶饮", stage: "需求确认", amount: "¥180,000", probability: 60 },
  { name: "清原饮品浓缩液项目", customer: "清原饮品", stage: "样品测试", amount: "¥120,000", probability: 45 },
];
