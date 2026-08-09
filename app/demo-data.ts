export type Message = {
  id: string;
  from: "customer" | "sales";
  text: string;
  time: string;
  ai?: boolean;
};

export type Customer = {
  id: string;
  initial: string;
  name: string;
  company: string;
  latest: string;
  wait: string;
  waitMinutes: number;
  unread: number;
  stage: string;
  intent: "高" | "中" | "低";
  value: "A" | "B" | "C";
  aiState: "话术就绪" | "分析完成" | "正在分析" | "待分析";
  confidence: number;
  coreNeed: string;
  concern: string;
  lastInteraction: string;
  nextStep: string;
  aiSuggestion: string;
  priority: number;
  messages: Message[];
};

export const initialCustomers: Customer[] = [
  {
    id: "xinhe",
    initial: "新",
    name: "新禾食品",
    company: "新禾食品有限公司",
    latest: "需要定制茶基底应用方案",
    wait: "8 分钟",
    waitMinutes: 8,
    unread: 2,
    stage: "方案沟通",
    intent: "高",
    value: "A",
    aiState: "分析完成",
    confidence: 82,
    coreNeed: "定制茶基底应用方案",
    concern: "风味稳定性、配方适配",
    lastInteraction: "今天 09:07",
    nextStep: "确认应用场景与预计用量",
    aiSuggestion: "先发送定制行业案例，并确认 SKU、采购规模与采购周期。",
    priority: 1,
    messages: [
      { id: "x1", from: "customer", text: "我们准备开发一款新茶饮，需要定制茶基底的应用方案。", time: "09:06" },
      { id: "x2", from: "customer", text: "你们能协助做配方适配吗？", time: "09:07" },
    ],
  },
  {
    id: "shanlan",
    initial: "山",
    name: "山岚茶饮",
    company: "山岚食品有限公司",
    latest: "想了解抹茶粉规格和报价",
    wait: "3 分钟",
    waitMinutes: 3,
    unread: 1,
    stage: "需求确认",
    intent: "高",
    value: "A",
    aiState: "话术就绪",
    confidence: 88,
    coreNeed: "高端茶饮用抹茶粉",
    concern: "规格、起订量、交付周期",
    lastInteraction: "今天 09:12",
    nextStep: "发送产品资料并确认用量",
    aiSuggestion: "发送抹茶粉规格资料，并补充确认预计月用量与交付周期。",
    priority: 2,
    messages: [
      { id: "s1", from: "customer", text: "你好，我们想了解你们抹茶粉的规格和报价，可以发一份资料吗？", time: "09:12" },
      { id: "s2", from: "sales", text: "可以的，我先了解一下您主要用于哪类产品？", time: "09:13", ai: true },
      { id: "s3", from: "customer", text: "主要用于高端茶饮，也想了解起订量和交付周期。", time: "09:14" },
    ],
  },
  {
    id: "qingyuan",
    initial: "清",
    name: "清原饮品",
    company: "清原饮品有限公司",
    latest: "样品测试后还有两个问题",
    wait: "12 分钟",
    waitMinutes: 12,
    unread: 1,
    stage: "样品测试",
    intent: "中",
    value: "B",
    aiState: "话术就绪",
    confidence: 71,
    coreNeed: "茶浓缩液样品优化",
    concern: "稳定性、储存条件",
    lastInteraction: "今天 09:03",
    nextStep: "补充确认测试条件",
    aiSuggestion: "先澄清测试温度、周期和包装方式，再判断稳定性问题。",
    priority: 3,
    messages: [
      { id: "q1", from: "customer", text: "样品测试后还有两个问题，常温稳定性和储存条件需要再确认。", time: "09:03" },
    ],
  },
  {
    id: "yunqi",
    initial: "云",
    name: "云栖食品",
    company: "云栖食品有限公司",
    latest: "请发最新产品资料",
    wait: "18 分钟",
    waitMinutes: 18,
    unread: 0,
    stage: "初步接触",
    intent: "中",
    value: "B",
    aiState: "正在分析",
    confidence: 79,
    coreNeed: "获取最新产品资料",
    concern: "产品覆盖范围、价格",
    lastInteraction: "今天 08:57",
    nextStep: "发送最新产品目录",
    aiSuggestion: "发送最新产品目录，并询问重点关注的产品类别。",
    priority: 4,
    messages: [{ id: "y1", from: "customer", text: "方便发一下你们最新的产品资料吗？", time: "08:57" }],
  },
  {
    id: "yuanchuan",
    initial: "远",
    name: "远川贸易",
    company: "远川贸易有限公司",
    latest: "下周可以安排进一步沟通",
    wait: "25 分钟",
    waitMinutes: 25,
    unread: 0,
    stage: "初步接触",
    intent: "低",
    value: "C",
    aiState: "待分析",
    confidence: 68,
    coreNeed: "确认后续合作可能",
    concern: "需求信息不足",
    lastInteraction: "今天 08:50",
    nextStep: "确认沟通时间与采购范围",
    aiSuggestion: "需求信息不足，建议先确认采购品类、预计用量与沟通时间。",
    priority: 5,
    messages: [{ id: "r1", from: "customer", text: "下周可以安排进一步沟通，具体需求到时再说。", time: "08:50" }],
  },
];
