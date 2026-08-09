export type Message = {
  id: string;
  from: "customer" | "sales";
  text: string;
  time: string;
  ai?: boolean;
  auto?: boolean;
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
  hasNewMessage?: boolean;
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
      { id: "x1", from: "customer", text: "你好，我们准备为便利店渠道开发两款即饮茶，想先了解你们的茶基底。", time: "08:42" },
      { id: "x2", from: "sales", text: "您好，可以的。两款产品目前计划做什么口味和包装规格？", time: "08:44" },
      { id: "x3", from: "customer", text: "一款蜜桃乌龙、一款轻乳茉莉，都是 450ml PET 瓶。", time: "08:47" },
      { id: "x4", from: "sales", text: "了解。预计首批和后续月用量大概是多少？我们会据此匹配浓度和供货方案。", time: "08:50", ai: true },
      { id: "x5", from: "customer", text: "首批各 3 万瓶，稳定后每月可能到 10 万瓶，计划两个月后上市。", time: "08:54" },
      { id: "x6", from: "sales", text: "这个规模适合先做小试。我可以安排应用工程师一起评估风味稳定性和成本区间。", time: "08:58" },
      { id: "x7", from: "customer", text: "我们准备开发一款新茶饮，需要定制茶基底的应用方案。", time: "09:06" },
      { id: "x8", from: "customer", text: "你们能协助做配方适配吗？", time: "09:07" },
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
      { id: "s1", from: "customer", text: "你好，我们准备升级门店的抹茶产品，想找颜色和香气更稳定的原料。", time: "08:56" },
      { id: "s2", from: "sales", text: "您好，主要是用于纯抹茶、拿铁，还是烘焙类产品？", time: "08:58" },
      { id: "s3", from: "customer", text: "以抹茶拿铁和抹茶冰淇淋为主，目前有 26 家门店。", time: "09:01" },
      { id: "s4", from: "sales", text: "建议对比饮品级和高香型两个规格。方便提供目前的月用量和目标成本吗？", time: "09:04", ai: true },
      { id: "s5", from: "customer", text: "每月大约 300 公斤，希望含税成本控制在每公斤 180 元以内。", time: "09:07" },
      { id: "s6", from: "sales", text: "收到，我会按颜色、香气和奶基底适配度整理两档样品方案。", time: "09:09" },
      { id: "s7", from: "customer", text: "你好，我们想了解你们抹茶粉的规格和报价，可以发一份资料吗？", time: "09:12" },
      { id: "s8", from: "sales", text: "可以的，我先把规格表发您，并同步确认起订量和交付周期。", time: "09:13", ai: true },
      { id: "s9", from: "customer", text: "好的，主要用于高端茶饮，也请标注最快交期。", time: "09:14" },
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
      { id: "q1", from: "sales", text: "上周寄出的茶浓缩液样品已经签收，测试时建议先按 1:12 稀释。", time: "08:31" },
      { id: "q2", from: "customer", text: "已收到，我们昨天做了第一轮测试，茶感和颜色基本符合预期。", time: "08:38" },
      { id: "q3", from: "sales", text: "好的，测试使用的是冷灌装还是热灌装？储存温度也会影响稳定性。", time: "08:42", ai: true },
      { id: "q4", from: "customer", text: "目前是 85℃ 热灌装，常温放置 24 小时后有轻微沉淀。", time: "08:47" },
      { id: "q5", from: "sales", text: "建议记录 pH、糖度和冷却时间，我先请应用团队判断沉淀来源。", time: "08:51" },
      { id: "q6", from: "customer", text: "pH 是 4.2，糖度 8.5，包装用的是透明 PET 瓶。", time: "08:56" },
      { id: "q7", from: "customer", text: "样品测试后还有两个问题，常温稳定性和储存条件需要再确认。", time: "09:03" },
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
    aiState: "分析完成",
    confidence: 79,
    coreNeed: "获取最新产品资料",
    concern: "产品覆盖范围、价格",
    lastInteraction: "今天 08:57",
    nextStep: "发送最新产品目录",
    aiSuggestion: "发送最新产品目录，并询问重点关注的产品类别。",
    priority: 4,
    messages: [
      { id: "y1", from: "customer", text: "你好，我们在评估明年的茶饮原料供应商，想先了解你们的产品线。", time: "08:33" },
      { id: "y2", from: "sales", text: "您好，我们主要提供茶粉、茶浓缩液和定制茶基底。您更关注哪一类？", time: "08:36" },
      { id: "y3", from: "customer", text: "目前更关注乌龙茶粉和茉莉茶浓缩液，计划用于连锁烘焙门店。", time: "08:41" },
      { id: "y4", from: "sales", text: "了解。产品是用于饮品现调还是预包装？我可以按应用方式筛选资料。", time: "08:45", ai: true },
      { id: "y5", from: "customer", text: "两种都会涉及，先看常规规格、认证和大概价格带。", time: "08:50" },
      { id: "y6", from: "sales", text: "没问题，我会把对应规格、认证文件和建议应用比例一起整理。", time: "08:53" },
      { id: "y7", from: "customer", text: "方便发一下你们最新的产品资料吗？", time: "08:57" },
    ],
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
    aiState: "分析完成",
    confidence: 68,
    coreNeed: "确认后续合作可能",
    concern: "需求信息不足",
    lastInteraction: "今天 08:50",
    nextStep: "确认沟通时间与采购范围",
    aiSuggestion: "需求信息不足，建议先确认采购品类、预计用量与沟通时间。",
    priority: 5,
    messages: [
      { id: "r1", from: "sales", text: "您好，看到贵司在做餐饮原料贸易，我们这边有茶粉和茶浓缩液产品。", time: "08:22" },
      { id: "r2", from: "customer", text: "我们确实在看茶类原料，不过目前还没确定具体品类。", time: "08:27" },
      { id: "r3", from: "sales", text: "了解。贵司主要服务茶饮、烘焙还是预包装食品客户？", time: "08:31" },
      { id: "r4", from: "customer", text: "客户类型比较分散，茶饮和食品工厂都有，需求还在收集。", time: "08:36" },
      { id: "r5", from: "sales", text: "我可以先发一份产品分类表，后续再按客户场景补充样品和报价。", time: "08:41", ai: true },
      { id: "r6", from: "customer", text: "可以，先发分类表。我们下周二下午也方便进一步沟通。", time: "08:46" },
      { id: "r7", from: "customer", text: "下周可以安排进一步沟通，具体需求到时再说。", time: "08:50" },
    ],
  },
];
