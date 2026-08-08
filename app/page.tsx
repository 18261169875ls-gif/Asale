"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Smile,
  Sparkles,
  SquareCheckBig,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type Message = {
  id: string;
  from: "customer" | "sales";
  text: string;
  time: string;
  ai?: boolean;
};

type Customer = {
  id: string;
  initial: string;
  name: string;
  company: string;
  latest: string;
  wait: string;
  unread: number;
  stage: string;
  intent: string;
  value: string;
  aiState: string;
  confidence: number;
  coreNeed: string;
  concern: string;
  lastInteraction: string;
  nextStep: string;
  messages: Message[];
};

const initialCustomers: Customer[] = [
  {
    id: "shanlan",
    initial: "山",
    name: "山岚茶饮",
    company: "山岚食品有限公司",
    latest: "想了解抹茶粉规格和报价",
    wait: "3 分钟",
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
    messages: [
      { id: "s1", from: "customer", text: "你好，我们想了解你们抹茶粉的规格和报价，可以发一份资料吗？", time: "09:12" },
      { id: "s2", from: "sales", text: "可以的，我先了解一下您主要用于哪类产品？", time: "09:13", ai: true },
      { id: "s3", from: "customer", text: "主要用于高端茶饮，也想了解起订量和交付周期。", time: "09:14" },
    ],
  },
  {
    id: "xinhe",
    initial: "新",
    name: "新禾食品",
    company: "新禾食品有限公司",
    latest: "需要定制茶基底应用方案",
    wait: "8 分钟",
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
    messages: [
      { id: "x1", from: "customer", text: "我们准备开发一款新茶饮，需要定制茶基底的应用方案。", time: "09:06" },
      { id: "x2", from: "customer", text: "你们能协助做配方适配吗？", time: "09:07" },
    ],
  },
  {
    id: "qingyuan",
    initial: "清",
    name: "清原饮品",
    company: "清原饮品有限公司",
    latest: "样品测试后还有两个问题",
    wait: "12 分钟",
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
    messages: [{ id: "y1", from: "customer", text: "方便发一下你们最新的产品资料吗？", time: "08:57" }],
  },
  {
    id: "yuanchuan",
    initial: "远",
    name: "远川贸易",
    company: "远川贸易有限公司",
    latest: "下周可以安排进一步沟通",
    wait: "25 分钟",
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
    messages: [{ id: "r1", from: "customer", text: "下周可以安排进一步沟通，具体需求到时再说。", time: "08:50" }],
  },
];

const navItems: Array<{ label: string; icon: LucideIcon }> = [
  { label: "消息", icon: MessageSquare },
  { label: "客户", icon: Users },
  { label: "任务", icon: SquareCheckBig },
  { label: "日程", icon: CalendarDays },
  { label: "业务工具", icon: Boxes },
];

export default function Home() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navExpanded, setNavExpanded] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(initialCustomers.map((customer) => [customer.id, customer.messages])),
  );
  const [query, setQuery] = useState("");
  const [listUpdated, setListUpdated] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [insertChoice, setInsertChoice] = useState(false);
  const [notice, setNotice] = useState("");
  const [chatRatio, setChatRatio] = useState(60);
  const [summary, setSummary] = useState("客户正在了解产品规格、起订量与交付周期，已明确主要用于高端茶饮。建议发送产品资料后继续确认预计用量。");
  const [decisions, setDecisions] = useState<Record<string, "accept" | "reject" | null>>({
    stage: null,
    intent: null,
    value: null,
  });
  const [taskText, setTaskText] = useState("发送资料后，明天下午跟进");
  const [aiPrompt, setAiPrompt] = useState("");
  const splitRef = useRef<HTMLDivElement>(null);
  const reminderRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCustomer = useMemo(
    () => customers.find((customer) => customer.id === activeId) ?? null,
    [activeId, customers],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("asale-chat-ratio");
    if (stored) setChatRatio(Number(stored));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name}${customer.company}${customer.latest}`.includes(query.trim()),
  );

  function openCustomer(id: string) {
    if (activeId && activeId !== id) {
      if (reminderRef.current) clearTimeout(reminderRef.current);
      reminderRef.current = setTimeout(() => {
        setNotice("上一位客户尚未结束处理，请返回会话或结束本次处理");
      }, 10 * 60 * 1000);
    }
    setActiveId(id);
    setNavExpanded(false);
    setDetailsOpen(false);
    setEnding(false);
    setInsertChoice(false);
  }

  function updateDraft(value: string) {
    if (!activeId) return;
    setDrafts((current) => ({ ...current, [activeId]: value }));
  }

  function insertReply(mode?: "replace" | "append") {
    if (!activeCustomer) return;
    const reply = activeCustomer.confidence < 75
      ? "为了更准确地为您准备方案，想先确认一下具体采购品类、预计用量和期望沟通时间，可以吗？"
      : "可以的。根据您用于高端茶饮的需求，我建议先了解细度、色泽和风味偏好，再为您匹配合适规格。我可以同时发送规格、起订量和交付周期供您参考。";
    const existing = drafts[activeCustomer.id] ?? "";
    if (existing && !mode) {
      setInsertChoice(true);
      return;
    }
    updateDraft(mode === "append" && existing ? `${existing}\n${reply}` : reply);
    setInsertChoice(false);
    setNotice("推荐话术已插入，可继续修改后发送");
  }

  function sendMessage() {
    if (!activeCustomer) return;
    const text = (drafts[activeCustomer.id] ?? "").trim();
    if (!text) return;
    const message: Message = {
      id: `${activeCustomer.id}-${Date.now()}`,
      from: "sales",
      text,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      ai: true,
    };
    setChatMessages((current) => ({
      ...current,
      [activeCustomer.id]: [...(current[activeCustomer.id] ?? []), message],
    }));
    updateDraft("");
    setNotice("消息已发送，跟进记录已自动保存");
  }

  function beginEnding() {
    if (!activeCustomer) return;
    if ((drafts[activeCustomer.id] ?? "").trim()) {
      setNotice("存在未发送草稿，请先发送或删除后再结束处理");
      return;
    }
    setEnding(true);
  }

  function finishCustomer() {
    if (!activeCustomer) return;
    const finishedName = activeCustomer.name;
    const next = customers.find((customer) => customer.id !== activeCustomer.id);
    setCustomers((current) => current.filter((customer) => customer.id !== activeCustomer.id));
    setActiveId(null);
    setNavExpanded(true);
    setEnding(false);
    setDetailsOpen(false);
    setNotice(`${finishedName} 已完成处理${next ? `，建议接下来处理 ${next.name}` : ""}`);
  }

  function startResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    const container = splitRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let latestRatio = chatRatio;
    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(70, Math.max(50, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      latestRatio = next;
      setChatRatio(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.localStorage.setItem("asale-chat-ratio", String(latestRatio));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <main className={`app-shell ${activeCustomer ? "conversation-mode" : "overview-mode"} ${navExpanded ? "nav-expanded" : "nav-collapsed"}`}>
      <aside className="global-nav" aria-label="全局导航">
        <div className="brand-block">
          <strong>{navExpanded ? "Asale" : "A"}</strong>
          {navExpanded && <><span>销售辅助系统</span><small>示例企业</small></>}
        </div>
        {navExpanded && <button className="new-chat" onClick={() => setActiveId(null)}><Plus size={17} /> 新对话</button>}
        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={label === "消息" ? "active" : ""} aria-label={label} title={label}>
              <span className="nav-icon"><Icon size={18} strokeWidth={1.8} /></span>{navExpanded && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="nav-bottom">
          <button aria-label="我的" title="我的"><span className="nav-icon"><CircleUserRound size={18} /></span>{navExpanded && <span>我的</span>}</button>
          <button aria-label={navExpanded ? "收起导航" : "展开导航"} onClick={() => setNavExpanded((value) => !value)}>
            <span className="nav-icon">{navExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}</span>{navExpanded && <span>收起</span>}
          </button>
        </div>
      </aside>

      {activeCustomer ? (
        <ConversationWorkspace
          customers={customers}
          activeCustomer={activeCustomer}
          activeId={activeId!}
          openCustomer={openCustomer}
          drafts={drafts}
          chatMessages={chatMessages}
          updateDraft={updateDraft}
          sendMessage={sendMessage}
          beginEnding={beginEnding}
          ending={ending}
          setEnding={setEnding}
          summary={summary}
          setSummary={setSummary}
          decisions={decisions}
          setDecisions={setDecisions}
          taskText={taskText}
          setTaskText={setTaskText}
          finishCustomer={finishCustomer}
          insertReply={insertReply}
          insertChoice={insertChoice}
          setInsertChoice={setInsertChoice}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          setNotice={setNotice}
          splitRef={splitRef}
          chatRatio={chatRatio}
          startResize={startResize}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
        />
      ) : (
        <Overview
          customers={filteredCustomers}
          openCustomer={openCustomer}
          query={query}
          setQuery={setQuery}
          listUpdated={listUpdated}
          setListUpdated={setListUpdated}
          setNotice={setNotice}
        />
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

function Overview({
  customers,
  openCustomer,
  query,
  setQuery,
  listUpdated,
  setListUpdated,
  setNotice,
}: {
  customers: Customer[];
  openCustomer: (id: string) => void;
  query: string;
  setQuery: (value: string) => void;
  listUpdated: boolean;
  setListUpdated: (value: boolean) => void;
  setNotice: (value: string) => void;
}) {
  return (
    <>
      <section className="overview" aria-label="消息总览">
        <header className="overview-header">
          <div><p>消息</p><h1>早上好，今天先处理这些</h1></div>
          <span className="demo-tag">演示数据</span>
        </header>
        <section className="summary-strip" aria-label="工作摘要">
          <Summary icon={FileText} title="昨日简报" value="已回复 8 位客户" />
          <Summary icon={ClipboardCheck} title="今日任务" value="5" />
          <Summary icon={Clock3} title="即将日程" value="2" />
          <Summary icon={Lightbulb} title="跟进建议" value="3" />
        </section>
        <section className="pending-panel">
          <div className="panel-title-row">
            <div><h2>待回复客户</h2><span>{customers.length} 位客户等待处理</span></div>
            <div className="list-actions">
              {listUpdated && <button className="update-button" onClick={() => { setListUpdated(false); setNotice("待回复列表已按最新优先级排序"); }}><RefreshCw size={14} />列表有更新</button>}
              <label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索客户" /></label>
              <button className="filter-button"><SlidersHorizontal size={14} />筛选</button>
            </div>
          </div>
          <div className="customer-table" role="table" aria-label="待回复客户">
            <div className="customer-row table-head" role="row">
              <span>客户</span><span>最新消息</span><span>等待时间</span><span>意向</span><span>价值</span><span>AI 状态</span>
            </div>
            {customers.map((customer) => (
              <button className="customer-row" role="row" key={customer.id} onClick={() => openCustomer(customer.id)}>
                <span className="customer-cell"><b className="avatar small">{customer.initial}</b><strong>{customer.name}</strong>{customer.unread > 0 && <i>{customer.unread}</i>}</span>
                <span className="latest-cell">{customer.latest}</span>
                <span className="wait-cell">{customer.wait}</span>
                <span><em className="soft-tag">{customer.intent}意向</em></span>
                <span><em className="value-tag">{customer.value}</em></span>
                <span><em className="soft-tag">{customer.aiState}</em></span>
              </button>
            ))}
          </div>
        </section>
        <section className="global-ai">
          <div><span className="ai-orb"><Sparkles size={18} /></span><strong>Asale AI</strong><span>跨客户查询、总结进度或执行销售任务</span></div>
          <div className="global-composer"><textarea aria-label="全局 AI 输入" placeholder="输入任务或口述内容…" /><div className="composer-tools"><button aria-label="添加附件"><Paperclip size={18} /></button><button aria-label="快捷任务"><SquareCheckBig size={18} /></button><div className="push-right"><button aria-label="语音输入"><Mic size={18} /></button><button className="send-circle" aria-label="发送 AI 任务"><Send size={17} /></button></div></div></div>
        </section>
      </section>
      <aside className="profile-panel empty" aria-label="客户画像">
        <h2>客户画像</h2>
        <div className="profile-empty"><span className="empty-avatar"><UserRound size={32} /></span><strong>选择客户后查看画像</strong><p>客户阶段、意向程度、客户价值和关键需求将在这里展示</p></div>
      </aside>
    </>
  );
}

function Summary({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string }) {
  return <article><span className="summary-icon"><Icon size={18} strokeWidth={1.8} /></span><div><strong>{title}</strong><p>{value}</p></div></article>;
}

type WorkspaceProps = {
  customers: Customer[];
  activeCustomer: Customer;
  activeId: string;
  openCustomer: (id: string) => void;
  drafts: Record<string, string>;
  chatMessages: Record<string, Message[]>;
  updateDraft: (value: string) => void;
  sendMessage: () => void;
  beginEnding: () => void;
  ending: boolean;
  setEnding: (value: boolean) => void;
  summary: string;
  setSummary: (value: string) => void;
  decisions: Record<string, "accept" | "reject" | null>;
  setDecisions: React.Dispatch<React.SetStateAction<Record<string, "accept" | "reject" | null>>>;
  taskText: string;
  setTaskText: (value: string) => void;
  finishCustomer: () => void;
  insertReply: (mode?: "replace" | "append") => void;
  insertChoice: boolean;
  setInsertChoice: (value: boolean) => void;
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  setNotice: (value: string) => void;
  splitRef: React.RefObject<HTMLDivElement | null>;
  chatRatio: number;
  startResize: (event: React.PointerEvent<HTMLButtonElement>) => void;
  detailsOpen: boolean;
  setDetailsOpen: (value: boolean) => void;
};

function ConversationWorkspace(props: WorkspaceProps) {
  const { activeCustomer: customer } = props;
  return (
    <>
      <aside className="conversation-list" aria-label="客户会话列表">
        <div className="conversation-list-header"><h2>客户会话</h2><div><button aria-label="搜索会话"><Search size={16} /></button><button aria-label="筛选会话"><SlidersHorizontal size={16} /></button></div></div>
        <div className="conversation-items">
          {props.customers.map((item, index) => (
            <button key={item.id} className={`conversation-item ${item.id === props.activeId ? "selected" : ""}`} onClick={() => props.openCustomer(item.id)}>
              <b className="avatar">{item.initial}</b>
              <span><strong>{item.name}</strong><small>{props.drafts[item.id] ? <i>草稿</i> : item.latest}</small><em>{item.wait}</em></span>
              {item.unread > 0 && <u>{item.unread}</u>}{index === 3 && !props.drafts[item.id] && <i className="draft-label">草稿</i>}
            </button>
          ))}
        </div>
      </aside>

      <div className="core-split" ref={props.splitRef} style={{ "--chat-ratio": `${props.chatRatio}%` } as React.CSSProperties}>
        <section className="chat-panel" aria-label="当前客户对话">
          <header className="chat-header">
            <div><h1>{customer.name}</h1><p>{customer.company} <span className="online-dot" /> 在线</p><em>{customer.stage}</em></div>
            <button className="secondary-button" onClick={props.beginEnding}>结束本次处理</button>
          </header>
          <div className="message-scroll">
            {(props.chatMessages[customer.id] ?? []).map((message) => (
              <div className={`message-line ${message.from}`} key={message.id}>
                <span className="message-meta">{message.from === "customer" ? customer.name : "我"}　{message.time}</span>
                <div className="bubble">{message.text}</div>
                {message.ai && <button className="ai-assisted" onClick={() => props.setNotice("可查看推荐原文、修改内容与推荐依据")}><Sparkles size={11} />AI 辅助</button>}
              </div>
            ))}
            <div className="new-divider"><span>以下为新消息</span></div>
          </div>
          <div className="chat-composer">
            <textarea
              aria-label={`回复${customer.name}`}
              value={props.drafts[customer.id] ?? ""}
              onChange={(event) => props.updateDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); props.sendMessage(); } }}
              placeholder={`回复${customer.name}…`}
            />
            <div className="composer-tools"><button aria-label="添加表情"><Smile size={18} /></button><button aria-label="添加图片"><ImageIcon size={18} /></button><button aria-label="添加文件"><Paperclip size={18} /></button><button onClick={() => { props.updateDraft(`${props.drafts[customer.id] ?? ""}（语音转写内容）`); props.setNotice("语音已转写，请确认后发送"); }} aria-label="语音输入"><Mic size={18} /></button><button className="send-circle push-right" onClick={props.sendMessage} aria-label="发送消息"><Send size={17} /></button></div>
            <small>Enter 发送　·　Shift + Enter 换行</small>
          </div>
        </section>

        <button className="resize-handle" aria-label="调整对话与 AI 区域宽度" onPointerDown={props.startResize}><span /></button>

        <aside className="ai-panel" aria-label="实时 AI 辅助">
          {props.ending ? (
            <EndProcessing {...props} />
          ) : (
            <AIContent {...props} />
          )}
        </aside>
      </div>

      <ProfilePanel customer={customer} detailsOpen={props.detailsOpen} setDetailsOpen={props.setDetailsOpen} />
    </>
  );
}

function AIContent(props: WorkspaceProps) {
  const customer = props.activeCustomer;
  const lowConfidence = customer.confidence < 75;
  return (
    <>
      <header className="ai-header"><div><h2>Asale AI</h2><span>分析完成</span></div><strong className={lowConfidence ? "confidence low" : "confidence"}>可信度 {customer.confidence}</strong></header>
      <div className="ai-scroll">
        {lowConfidence && <section className="uncertainty"><strong>不建议直接参考</strong><p>客户需求范围与采购信息不足，暂时无法准确判断价值。</p><ul><li>缺少具体采购品类</li><li>缺少预计用量</li><li>沟通时间尚未确认</li></ul></section>}
        <section className="analysis-pair"><div><span>客户意图</span><strong>{lowConfidence ? "需要补充确认" : "询价并索取产品资料"}</strong></div><div><span>客户价值</span><strong>{lowConfidence ? "暂不判断" : `${customer.intent}价值`}</strong></div></section>
        <section className="reply-card"><h3>{lowConfidence ? "澄清式话术" : "主推荐话术"}</h3><p>{lowConfidence ? "为了更准确地为您准备方案，想先确认一下具体采购品类、预计用量和期望沟通时间，可以吗？" : "可以的。根据您用于高端茶饮的需求，我建议先了解细度、色泽和风味偏好，再为您匹配合适规格。我可以同时发送规格、起订量和交付周期供您参考。"}</p><button className="primary-button" onClick={() => props.insertReply()}>插入输入框</button></section>
        {props.insertChoice && <section className="insert-choice"><strong>输入框已有内容</strong><p>请选择如何插入推荐话术</p><div><button onClick={() => props.insertReply("replace")}>替换</button><button onClick={() => props.insertReply("append")}>追加</button><button onClick={() => props.setInsertChoice(false)}>取消</button></div></section>}
        {!lowConfidence && <button className="alternative-row">查看 2 条备选话术 <ChevronDown size={15} /></button>}
        <section className="evidence"><h3>推荐依据</h3><ul><li>明确采购场景</li><li>主动询问规格与报价</li><li>关注交付能力</li></ul></section>
        <section className="task-card"><h3>下一步任务建议</h3><p>发送资料后，明天下午跟进</p><div><button className="primary-button" onClick={() => props.setNotice("任务已确认创建")}>确认</button><button onClick={() => props.setNotice("可在任务页修改时间和内容")}>编辑</button></div></section>
      </div>
      <div className="ai-composer"><textarea value={props.aiPrompt} onChange={(event) => props.setAiPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); props.setNotice("AI 任务已提交"); props.setAiPrompt(""); } }} placeholder="向 AI 提问或下达任务…" aria-label="AI 指令输入" /><div><button onClick={() => { props.setAiPrompt(`${props.aiPrompt}（语音转写内容）`); props.setNotice("语音已转写，请确认后提交"); }} aria-label="AI 语音输入"><Mic size={17} /></button><button className="send-circle" onClick={() => { props.setNotice("AI 任务已提交"); props.setAiPrompt(""); }} aria-label="发送 AI 任务"><Send size={16} /></button></div></div>
    </>
  );
}

function EndProcessing(props: WorkspaceProps) {
  const suggestions = [
    ["stage", "客户阶段", "初步接触", "需求确认"],
    ["intent", "意向程度", "中", "高"],
    ["value", "客户价值", "B", "A"],
  ];
  return (
    <div className="end-panel">
      <header><div><h2>结束本次处理</h2><span>确认后写入本次跟进记录</span></div><button onClick={() => props.setEnding(false)} aria-label="关闭"><X size={17} /></button></header>
      <div className="end-scroll">
        <label><strong>沟通总结</strong><textarea value={props.summary} onChange={(event) => props.setSummary(event.target.value)} /></label>
        <section className="update-section"><h3>客户数据更新建议</h3>{suggestions.map(([key, label, before, after]) => <article key={key}><div><span>{label}</span><p>{before} <b>→</b> {after}</p></div><div><button className={props.decisions[key] === "accept" ? "selected" : ""} onClick={() => props.setDecisions((current) => ({ ...current, [key]: "accept" }))}>接受</button><button className={props.decisions[key] === "reject" ? "selected" : ""} onClick={() => props.setDecisions((current) => ({ ...current, [key]: "reject" }))}>拒绝</button></div></article>)}</section>
        <label><strong>下一步任务</strong><input value={props.taskText} onChange={(event) => props.setTaskText(event.target.value)} /><small>任务建议可稍后在“任务—待确认”中处理</small></label>
      </div>
      <footer><button onClick={() => props.setEnding(false)}>取消</button><button className="primary-button" onClick={props.finishCustomer}>确认并结束处理</button></footer>
    </div>
  );
}

function ProfilePanel({ customer, detailsOpen, setDetailsOpen }: { customer: Customer; detailsOpen: boolean; setDetailsOpen: (value: boolean) => void }) {
  const rows = [
    ["客户阶段", customer.stage],
    ["意向程度", customer.intent],
    ["客户价值", customer.value],
    ["核心需求", customer.coreNeed],
    ["关键关注", customer.concern],
    ["最近互动", customer.lastInteraction],
    ["下一步建议", customer.nextStep],
  ];
  return (
    <aside className="profile-panel" aria-label="客户画像摘要">
      <h2>客户画像</h2>
      <div className="profile-identity"><b className="avatar large">{customer.initial}</b><div><strong>{customer.name}</strong><span>{customer.company}</span></div></div>
      <div className="profile-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <button className="full-profile" onClick={() => setDetailsOpen(true)}>查看完整资料</button>
      {detailsOpen && <div className="details-drawer"><header><div><span>客户详情</span><h2>{customer.name}</h2></div><button onClick={() => setDetailsOpen(false)} aria-label="关闭客户详情"><X size={18} /></button></header><section><h3>联系方式</h3><p>企业微信已连接</p><h3>客户画像</h3><p>{customer.coreNeed}，重点关注{customer.concern}。</p><h3>历史跟进</h3><p>最近互动：{customer.lastInteraction}</p><h3>购买记录</h3><p>暂无成交记录</p><h3>关联商机</h3><p>{customer.name} · 年度采购</p><h3>文件资料</h3><p>产品介绍.pdf　规格说明.xlsx</p></section></div>}
    </aside>
  );
}
