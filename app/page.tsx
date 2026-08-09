"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  FileText,
  Image as ImageIcon,
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
import { initialCustomers, type Customer, type Message } from "./demo-data";

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
  const reminderRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCustomer = useMemo(
    () => customers.find((customer) => customer.id === activeId) ?? null,
    [activeId, customers],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem("asale-chat-ratio");
    // Restore the user's last width preference after the client has mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setSummary(`客户本次主要沟通“${activeCustomer.latest}”，核心需求为${activeCustomer.coreNeed}，重点关注${activeCustomer.concern}。`);
    setTaskText(`${activeCustomer.nextStep}，明天下午跟进`);
    setDecisions({ stage: null, intent: null, value: null });
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
    const container = event.currentTarget.parentElement;
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
  const [globalPrompt, setGlobalPrompt] = useState("");
  const priorityCustomer = customers[0] ?? null;
  const highIntentCustomers = customers.filter((customer) => customer.intent === "高");

  function submitGlobalPrompt() {
    if (!globalPrompt.trim()) return;
    setNotice("AI 任务已提交，正在整理结果");
    setGlobalPrompt("");
  }

  function applyQuickPrompt(prompt: string) {
    setGlobalPrompt(prompt);
    setNotice("快捷指令已填入，可继续补充");
  }

  return (
    <>
      <section className="overview" aria-label="消息总览">
        <header className="overview-header">
          <div>
            <p className="eyebrow">消息</p>
            <h1><span>早上好，</span>今天有 {customers.length} 位客户需要处理</h1>
            <p className="header-subtitle">其中 <strong>{highIntentCustomers.length} 位高意向客户</strong>值得优先跟进</p>
          </div>
          <button className="header-cta" disabled={!priorityCustomer} onClick={() => priorityCustomer && openCustomer(priorityCustomer.id)}>
            开始今日任务 <ArrowRight size={16} />
          </button>
        </header>

        <section className="today-focus" aria-label="今日重点">
          <span className="focus-icon"><Sparkles size={18} /></span>
          <div>
            <p>今日重点</p>
            <h2>优先完成 {highIntentCustomers.length} 位高意向客户跟进</h2>
            <span>AI 已根据客户价值、销售阶段和最近互动完成优先级排序</span>
          </div>
          <div className="focus-action">
            <strong>{highIntentCustomers.map((customer) => customer.name).join(" · ") || "暂无高意向客户"}</strong>
            <button onClick={() => setNotice("已展示全部高意向客户")}>查看全部 <ArrowRight size={14} /></button>
          </div>
        </section>

        <section className="summary-strip" aria-label="工作摘要">
          <Summary icon={ClipboardCheck} title="今日任务" value="5" detail="2 项建议优先处理" variant="primary" />
          <Summary icon={Sparkles} title="AI 跟进建议" value="3" detail="基于客户最新状态生成" variant="ai" />
          <Summary icon={Clock3} title="即将日程" value="2" detail="最近 2 小时" />
          <Summary icon={FileText} title="昨日简报" value="8" detail="昨日已触达客户" variant="muted" />
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
          <div className="customer-queue" aria-label="待回复客户">
            {!priorityCustomer && (
              <div className="queue-empty"><strong>暂无待处理客户</strong><span>今天所有客户都已经处理完成 🎉</span><button>查看全部客户</button></div>
            )}
            {priorityCustomer && (
              <article className="priority-customer">
                <button className="priority-main" onClick={() => openCustomer(priorityCustomer.id)} aria-label={`跟进${priorityCustomer.name}`}>
                  <span className="priority-avatar avatar">{priorityCustomer.initial}</span>
                  <span className="priority-copy">
                    <span className="customer-title-line"><strong>{priorityCustomer.name}</strong><em className="priority-badge">优先</em>{priorityCustomer.unread > 0 && <i>{priorityCustomer.unread}</i>}</span>
                    <span className="customer-latest">{priorityCustomer.latest}</span>
                  </span>
                  <span className="customer-status-stack">
                    <IntentBadge intent={priorityCustomer.intent} />
                    <TimeStatus minutes={priorityCustomer.waitMinutes} label={priorityCustomer.wait} />
                  </span>
                </button>
                <div className="priority-advice">
                  <span><Sparkles size={15} /> Advisor 建议</span>
                  <p>{priorityCustomer.aiSuggestion}</p>
                  <div><em>阶段：{priorityCustomer.stage}</em><em>客户价值：{priorityCustomer.value}</em></div>
                  <button onClick={() => openCustomer(priorityCustomer.id)}>立即跟进 <ArrowRight size={15} /></button>
                </div>
              </article>
            )}
            {customers.slice(1).map((customer) => (
              <button className="compact-customer" key={customer.id} onClick={() => openCustomer(customer.id)}>
                <span className="customer-cell"><b className="avatar small">{customer.initial}</b><span><strong>{customer.name}</strong><small>{customer.latest}</small></span>{customer.unread > 0 && <i>{customer.unread}</i>}</span>
                <span className="compact-meta"><IntentBadge intent={customer.intent} /><em>价值 {customer.value}</em><TimeStatus minutes={customer.waitMinutes} label={customer.wait} /><AnalysisBadge state={customer.aiState} /></span>
                <span className="row-actions"><em>查看画像</em><em>生成建议</em><strong>立即跟进 <ArrowRight size={13} /></strong></span>
              </button>
            ))}
          </div>
        </section>

        <section className="global-ai">
          <div className="global-ai-intro"><span className="ai-orb"><Sparkles size={18} /></span><div><strong>Advisor</strong><span>查询客户、分析机会并执行销售任务</span></div></div>
          <div className="global-composer">
            <textarea value={globalPrompt} onChange={(event) => setGlobalPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitGlobalPrompt(); } }} aria-label="全局 AI 输入" placeholder="帮我整理今天最值得跟进的客户…" />
            <div className="composer-tools"><button aria-label="添加附件"><Paperclip size={18} /></button><div className="push-right"><button aria-label="语音输入" onClick={() => setGlobalPrompt(`${globalPrompt}（语音转写内容）`)}><Mic size={18} /></button><button className="send-circle" aria-label="发送 AI 任务" onClick={submitGlobalPrompt}><Send size={17} /></button></div></div>
          </div>
          <div className="quick-prompts">
            <button onClick={() => applyQuickPrompt("请总结今天最值得优先跟进的客户，并说明原因和建议动作。")}>总结重点客户</button>
            <button onClick={() => applyQuickPrompt("请根据优先客户最近的沟通记录和需求，生成一段合适的跟进话术。")}>生成跟进话术</button>
            <button onClick={() => applyQuickPrompt("请整理我的今日任务，并按紧急程度排序。")}>查看今日任务</button>
          </div>
        </section>
      </section>
      <OverviewProfile customer={priorityCustomer} openCustomer={openCustomer} />
    </>
  );
}

function Summary({ icon: Icon, title, value, detail, variant = "default" }: { icon: LucideIcon; title: string; value: string; detail: string; variant?: "default" | "primary" | "ai" | "muted" }) {
  return <article className={`metric-card ${variant}`}><div><span className="summary-icon"><Icon size={18} strokeWidth={1.8} /></span><strong>{title}</strong></div><p>{value}</p><small>{detail}</small></article>;
}

function IntentBadge({ intent }: { intent: Customer["intent"] }) {
  return <em className={`intent-badge intent-${intent === "高" ? "high" : intent === "中" ? "medium" : "low"}`}>{intent}意向</em>;
}

function AnalysisBadge({ state }: { state: Customer["aiState"] }) {
  return <em className={`analysis-badge ${state === "正在分析" ? "analyzing" : ""}`}>{state === "正在分析" && <span className="mini-spinner" />}{state}</em>;
}

function TimeStatus({ minutes, label }: { minutes: number; label: string }) {
  const state = minutes > 20 ? "danger" : minutes >= 10 ? "warning" : "normal";
  return <em className={`time-status ${state}`}>{label}</em>;
}

function OverviewProfile({ customer, openCustomer }: { customer: Customer | null; openCustomer: (id: string) => void }) {
  if (!customer) {
    return <aside className="profile-panel empty" aria-label="客户画像"><h2>客户画像</h2><div className="profile-empty"><span className="empty-avatar"><UserRound size={30} /></span><strong>暂无客户数据</strong><p>出现待处理客户后，Advisor 会自动展示优先客户画像。</p></div></aside>;
  }

  return (
    <aside className="profile-panel overview-profile" aria-label="今日重点客户画像">
      <div className="profile-heading"><div><span>客户画像</span><h2>今日重点客户</h2></div><Sparkles size={18} /></div>
      <div className="profile-hero"><b className="avatar large">{customer.initial}</b><div><strong>{customer.name}</strong><span>{customer.intent}意向 · {customer.stage}</span></div></div>
      <section className="score-section"><span>成交评分</span><strong>{customer.confidence}</strong><div><i style={{ width: `${customer.confidence}%` }} /></div></section>
      <section className="profile-section"><span>核心需求</span><p>{customer.coreNeed}</p></section>
      <section className="profile-section"><span>最近动态</span><p>{customer.wait}前提出：{customer.latest}</p></section>
      <section className="advisor-judgment"><span><Sparkles size={15} /> Advisor 下一步建议</span><p>{customer.aiSuggestion}</p></section>
      <button className="profile-primary" onClick={() => openCustomer(customer.id)}>立即跟进 <ArrowRight size={15} /></button>
      <button className="full-profile" onClick={() => openCustomer(customer.id)}>查看完整画像</button>
    </aside>
  );
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

      <div className="core-split" style={{ "--chat-ratio": `${props.chatRatio}%` } as React.CSSProperties}>
        <section className="chat-panel" aria-label="当前客户对话">
          <header className="chat-header">
            <div><h1>{customer.name}</h1><p>{customer.company} <span className="online-dot" /> 在线</p><em>{customer.stage}</em></div>
            <button className="secondary-button" onClick={props.beginEnding}>结束本次处理</button>
          </header>
          <div className="message-scroll">
            {(props.chatMessages[customer.id] ?? []).map((message) => (
              <div className={`message-line ${message.from}`} key={message.id}>
                <span className="message-meta">{message.from === "customer" ? customer.name : "我"} · {message.time}</span>
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
            <small>Enter 发送 · Shift + Enter 换行</small>
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
      <header className="ai-header"><div><h2>Advisor</h2><span>分析完成</span></div><strong className={lowConfidence ? "confidence low" : "confidence"}>可信度 {customer.confidence}</strong></header>
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
      {detailsOpen && <div className="details-drawer"><header><div><span>客户详情</span><h2>{customer.name}</h2></div><button onClick={() => setDetailsOpen(false)} aria-label="关闭客户详情"><X size={18} /></button></header><section><h3>联系方式</h3><p>企业微信已连接</p><h3>客户画像</h3><p>{customer.coreNeed}，重点关注{customer.concern}。</p><h3>历史跟进</h3><p>最近互动：{customer.lastInteraction}</p><h3>购买记录</h3><p>暂无成交记录</p><h3>关联商机</h3><p>{customer.name} · 年度采购</p><h3>文件资料</h3><p>产品介绍.pdf · 规格说明.xlsx</p></section></div>}
    </aside>
  );
}
