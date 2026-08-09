"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Pencil,
  Search,
  Send,
  SlidersHorizontal,
  Smile,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { GlobalNav } from "./components/global-nav";
import { StageBadge, UnreadBadge } from "./components/status-badges";
import { initialCustomers, type Customer, type Message } from "./demo-data";

type AutomationMode = "auto" | "assist" | "manual";
type CustomerFilterState = {
  intent: "全部" | Customer["intent"];
  stage: "全部" | string;
  aiState: "全部" | Customer["aiState"];
};
type AnalysisRun = {
  version: number;
  source: Message["from"];
  text: string;
  time: string;
  total: number;
};

const defaultAssistantName = "Advisor 助手";

const automationModes: Array<{ id: AutomationMode; label: string; shortLabel: string }> = [
  { id: "auto", label: "AI 全自动", shortLabel: "全自动" },
  { id: "assist", label: "AI 半自动", shortLabel: "半自动" },
  { id: "manual", label: "纯手动回复", shortLabel: "手动" },
];

function suggestedReply(customer: Customer) {
  if (customer.confidence < 75) {
    return "为了更准确地为您准备方案，想先确认一下具体采购品类、预计用量和期望沟通时间，可以吗？";
  }
  return `可以的。根据您对“${customer.coreNeed}”的需求，我建议先确认${customer.concern}，再为您匹配合适方案。我也可以同步发送相关资料供您参考。`;
}

function replyForIncomingMessage(text: string) {
  if (/报价|价格|成本/.test(text)) return "可以的，我会按您的目标成本整理对应规格和阶梯报价。为了保证报价准确，再确认一下预计月用量和期望交付时间，可以吗？";
  if (/沉淀|稳定|储存|pH|糖度/.test(text)) return "收到这些测试参数。我会请应用团队结合灌装温度、pH 和包装方式判断稳定性，并给您一份复测建议。";
  if (/资料|规格|认证/.test(text)) return "没问题，我会把相关产品规格、认证文件和建议应用比例整理给您。请问您更关注饮品、烘焙还是预包装应用？";
  if (/下周|沟通|时间/.test(text)) return "可以，下周二下午方便。我先把产品分类和适用场景发您，沟通时再根据客户类型确认重点品类与预计用量。";
  return `收到您提到的“${text.slice(0, 28)}${text.length > 28 ? "…" : ""}”。我先结合当前需求整理方案，并补充确认用量、时间和关键规格。`;
}

export default function Home() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navExpanded, setNavExpanded] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(
    Object.fromEntries(initialCustomers.map((customer) => [customer.id, customer.messages])),
  );
  const [analysisRuns, setAnalysisRuns] = useState<Record<string, AnalysisRun>>(() => Object.fromEntries(initialCustomers.map((customer) => {
    const latestMessage = customer.messages.at(-1)!;
    return [customer.id, { version: 0, source: latestMessage.from, text: latestMessage.text, time: latestMessage.time, total: customer.messages.length }];
  })));
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFilterState>({ intent: "全部", stage: "全部", aiState: "全部" });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [chatRatio, setChatRatio] = useState(60);
  const [aiPrompt, setAiPrompt] = useState("");
  const [assistantName, setAssistantName] = useState(defaultAssistantName);
  const [automationMode, setAutomationMode] = useState<AutomationMode>("assist");
  const [advisorReplies, setAdvisorReplies] = useState<Record<string, string>>(
    Object.fromEntries(initialCustomers.map((customer) => [customer.id, suggestedReply(customer)])),
  );
  const automationModeRef = useRef<AutomationMode>("assist");
  const assistantNameRef = useRef(defaultAssistantName);
  const analysisVersionRef = useRef<Record<string, number>>(Object.fromEntries(initialCustomers.map((customer) => [customer.id, 0])));
  const autoRepliedRef = useRef(new Set<string>());

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
    const stored = window.localStorage.getItem("asale-automation-mode") as AutomationMode | null;
    if (!stored || !automationModes.some((mode) => mode.id === stored)) return;
    automationModeRef.current = stored;
    // Restore the user's last automation preference after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutomationMode(stored);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("asale-assistant-name")?.trim();
    if (!stored) return;
    assistantNameRef.current = stored;
    // Restore the locally saved assistant name after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAssistantName(stored);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const triggerAnalysis = useCallback((customerId: string, message: Message) => {
    const version = (analysisVersionRef.current[customerId] ?? 0) + 1;
    analysisVersionRef.current[customerId] = version;
    setAnalysisRuns((current) => {
      const previous = current[customerId];
      return { ...current, [customerId]: { version, source: message.from, text: message.text, time: message.time, total: (previous?.total ?? 0) + 1 } };
    });
    if (message.from === "customer") {
      setAdvisorReplies((current) => ({ ...current, [customerId]: replyForIncomingMessage(message.text) }));
    }
    setCustomers((current) => current.map((customer) => customer.id === customerId ? {
      ...customer,
      aiState: "正在分析",
      confidence: Math.min(95, customer.confidence + (message.from === "customer" ? 1 : 0)),
      lastInteraction: `今天 ${message.time}`,
      aiSuggestion: message.from === "customer" ? "正在结合客户最新信息更新意图、价值与下一步建议。" : "已复盘销售本次回复，继续监听客户反馈。",
    } : customer));
    window.setTimeout(() => {
      if (analysisVersionRef.current[customerId] !== version) return;
      setCustomers((current) => current.map((customer) => customer.id === customerId ? { ...customer, aiState: "分析完成", aiSuggestion: message.from === "customer" ? "最新消息已完成分析，建议按更新后的话术继续确认关键需求。" : "销售回复已复盘，建议等待客户反馈并准备下一步资料。" } : customer));
    }, 2800);
  }, []);

  const appendAdvisorMessage = useCallback((customer: Customer, text: string, automated: boolean) => {
    if (!text.trim()) return;
    const message: Message = {
      id: `${customer.id}-advisor-${Date.now()}`,
      from: "sales",
      text: text.trim(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      ai: true,
      auto: automated,
    };
    setChatMessages((current) => ({
      ...current,
      [customer.id]: [...(current[customer.id] ?? []), message],
    }));
    triggerAnalysis(customer.id, message);
    setCustomers((current) => current.map((item) => item.id === customer.id ? {
      ...item,
      unread: 0,
      hasNewMessage: false,
      latest: automated ? "AI 已自动回复" : `${assistantNameRef.current}话术已发送`,
      wait: "刚刚",
      waitMinutes: 0,
    } : item));
    setNotice(automated ? `${customer.name} 的新消息已由 AI 自动回复` : `已向 ${customer.name} 发送${assistantNameRef.current}话术`);
  }, [triggerAnalysis]);

  const autoReplyCustomer = useCallback((customer: Customer) => {
    if (customer.intent !== "低" || autoRepliedRef.current.has(customer.id)) return;
    autoRepliedRef.current.add(customer.id);
    appendAdvisorMessage(customer, suggestedReply(customer), true);
  }, [appendAdvisorMessage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const demoCustomer = initialCustomers.find((customer) => customer.id === "yuanchuan");
      if (!demoCustomer) return;
      const incomingText = "我们下周二下午方便沟通，想先了解适合贸易渠道的产品范围。";
      const incomingCustomer: Customer = {
        ...demoCustomer,
        latest: incomingText,
        wait: "刚刚",
        waitMinutes: 0,
        unread: demoCustomer.unread + 1,
        hasNewMessage: true,
        aiState: "分析完成",
        priority: 0,
      };
      setCustomers((current) => {
        if (!current.some((customer) => customer.id === incomingCustomer.id)) return current;
        return [incomingCustomer, ...current.filter((customer) => customer.id !== incomingCustomer.id)]
          .map((customer, index) => ({ ...customer, priority: index + 1 }));
      });
      setChatMessages((current) => ({
        ...current,
        [incomingCustomer.id]: [...(current[incomingCustomer.id] ?? []), {
          id: `${incomingCustomer.id}-incoming-${Date.now()}`,
          from: "customer",
          text: incomingText,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        }],
      }));
      triggerAnalysis(incomingCustomer.id, {
        id: `${incomingCustomer.id}-analysis-${Date.now()}`,
        from: "customer",
        text: incomingText,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      });
      setNotice(`${incomingCustomer.name} 发来新消息，列表已自动更新`);
      if (automationModeRef.current === "auto") {
        window.setTimeout(() => autoReplyCustomer(incomingCustomer), 1600);
      }
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [autoReplyCustomer, triggerAnalysis]);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name}${customer.company}${customer.latest}`.includes(query.trim())
      && (filters.intent === "全部" || customer.intent === filters.intent)
      && (filters.stage === "全部" || customer.stage === filters.stage)
      && (filters.aiState === "全部" || customer.aiState === filters.aiState),
  );

  function openCustomer(id: string) {
    setActiveId(id);
    setCustomers((current) => current.map((customer) => customer.id === id ? { ...customer, unread: 0, hasNewMessage: false } : customer));
    setNavExpanded(false);
    setDetailsOpen(false);
  }

  function updateDraft(value: string) {
    if (!activeId) return;
    setDrafts((current) => ({ ...current, [activeId]: value }));
  }

  function updateAdvisorReply(value: string) {
    if (!activeCustomer) return;
    setAdvisorReplies((current) => ({ ...current, [activeCustomer.id]: value }));
  }

  function sendAdvisorReply() {
    if (!activeCustomer || automationMode === "manual") return;
    appendAdvisorMessage(activeCustomer, advisorReplies[activeCustomer.id] ?? "", false);
  }

  function changeAutomationMode(mode: AutomationMode) {
    setAutomationMode(mode);
    automationModeRef.current = mode;
    window.localStorage.setItem("asale-automation-mode", mode);
    setNotice(`${automationModes.find((item) => item.id === mode)?.label}已启用`);
    if (mode === "auto") {
      const pendingLowIntent = customers.find((customer) => customer.intent === "低" && customer.hasNewMessage)
        ?? (activeCustomer?.intent === "低" ? activeCustomer : null);
      if (pendingLowIntent) window.setTimeout(() => autoReplyCustomer(pendingLowIntent), 800);
    }
  }

  function renameAssistant(name: string) {
    const nextName = name.trim().slice(0, 20) || defaultAssistantName;
    assistantNameRef.current = nextName;
    setAssistantName(nextName);
    window.localStorage.setItem("asale-assistant-name", nextName);
    setNotice(`AI 助手已命名为“${nextName}”`);
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
    };
    setChatMessages((current) => ({
      ...current,
      [activeCustomer.id]: [...(current[activeCustomer.id] ?? []), message],
    }));
    triggerAnalysis(activeCustomer.id, message);
    updateDraft("");
    setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? { ...customer, unread: 0, hasNewMessage: false, latest: "已手动回复", wait: "刚刚", waitMinutes: 0 } : customer));
    setNotice("消息已发送，AI 已自动记录本次跟进");
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
      <GlobalNav
        expanded={navExpanded}
        active="messages"
        onToggle={() => setNavExpanded((value) => !value)}
        onNewConversation={() => { setActiveId(null); setNavExpanded(true); }}
      />

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
          analysisRun={analysisRuns[activeId!]}
          assistantName={assistantName}
          renameAssistant={renameAssistant}
          automationMode={automationMode}
          changeAutomationMode={changeAutomationMode}
          advisorReply={advisorReplies[activeId!] ?? ""}
          updateAdvisorReply={updateAdvisorReply}
          sendAdvisorReply={sendAdvisorReply}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          setNotice={setNotice}
          chatRatio={chatRatio}
          startResize={startResize}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
          returnToOverview={() => { setActiveId(null); setNavExpanded(true); }}
        />
      ) : (
        <Overview
          customers={filteredCustomers}
          openCustomer={openCustomer}
          query={query}
          setQuery={setQuery}
          filterCount={[filters.intent, filters.stage, filters.aiState].filter((value) => value !== "全部").length}
          openFilters={() => setFiltersOpen(true)}
          setNotice={setNotice}
          assistantName={assistantName}
        />
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
      {filtersOpen && <FilterDrawer value={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />}
    </main>
  );
}

function Overview({
  customers,
  openCustomer,
  query,
  setQuery,
  filterCount,
  openFilters,
  setNotice,
  assistantName,
}: {
  customers: Customer[];
  openCustomer: (id: string) => void;
  query: string;
  setQuery: (value: string) => void;
  filterCount: number;
  openFilters: () => void;
  setNotice: (value: string) => void;
  assistantName: string;
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
              <label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索客户" /></label>
              <button className={`filter-button ${filterCount ? "active" : ""}`} onClick={openFilters}><SlidersHorizontal size={14} />{filterCount ? `已筛选 ${filterCount}` : "筛选"}</button>
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
                    <span className="customer-title-line"><strong>{priorityCustomer.name}</strong><em className="priority-badge">优先</em><UnreadBadge count={priorityCustomer.unread} dot={priorityCustomer.hasNewMessage && priorityCustomer.unread === 0} /></span>
                    <span className="customer-latest">{priorityCustomer.latest}</span>
                  </span>
                  <span className="customer-status-stack">
                    <IntentBadge intent={priorityCustomer.intent} />
                    <TimeStatus minutes={priorityCustomer.waitMinutes} label={priorityCustomer.wait} />
                  </span>
                </button>
                <div className="priority-advice">
                  <span><Sparkles size={15} /> {assistantName}建议</span>
                  <p>{priorityCustomer.aiSuggestion}</p>
                  <div><em>阶段：{priorityCustomer.stage}</em><em>客户价值：{priorityCustomer.value}</em></div>
                  <button onClick={() => openCustomer(priorityCustomer.id)}>立即跟进 <ArrowRight size={15} /></button>
                </div>
              </article>
            )}
            {customers.slice(1).map((customer) => (
              <button className="compact-customer" key={customer.id} onClick={() => openCustomer(customer.id)}>
                <span className="customer-cell"><b className="avatar small">{customer.initial}</b><span><strong>{customer.name}</strong><small>{customer.latest}</small></span><UnreadBadge count={customer.unread} dot={customer.hasNewMessage && customer.unread === 0} /></span>
                <span className="compact-meta"><IntentBadge intent={customer.intent} /><em>价值 {customer.value}</em><TimeStatus minutes={customer.waitMinutes} label={customer.wait} /><AnalysisBadge state={customer.aiState} /></span>
                <span className="row-actions"><em>查看画像</em><em>生成建议</em><strong>立即跟进 <ArrowRight size={13} /></strong></span>
              </button>
            ))}
          </div>
        </section>

        <section className="global-ai">
          <div className="global-ai-intro"><span className="ai-orb"><Sparkles size={18} /></span><div><strong>{assistantName}</strong><span>查询客户、分析机会并执行销售任务</span></div></div>
          <div className="global-composer">
            <textarea value={globalPrompt} onChange={(event) => setGlobalPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitGlobalPrompt(); } }} aria-label="全局 AI 输入" placeholder="帮我整理今天最值得跟进的客户…" />
            <div className="composer-tools"><button aria-label="添加附件"><Paperclip size={18} /></button><div className="composer-end-tools"><button aria-label="语音输入" onClick={() => setGlobalPrompt(`${globalPrompt}（语音转写内容）`)}><Mic size={18} /></button><button className="send-circle" aria-label="发送 AI 任务" onClick={submitGlobalPrompt}><Send size={17} /></button></div></div>
          </div>
          <div className="quick-prompts">
            <button onClick={() => applyQuickPrompt("请总结今天最值得优先跟进的客户，并说明原因和建议动作。")}>总结重点客户</button>
            <button onClick={() => applyQuickPrompt("请根据优先客户最近的沟通记录和需求，生成一段合适的跟进话术。")}>生成跟进话术</button>
            <button onClick={() => applyQuickPrompt("请整理我的今日任务，并按紧急程度排序。")}>查看今日任务</button>
          </div>
        </section>
      </section>
      <OverviewProfile customer={priorityCustomer} openCustomer={openCustomer} assistantName={assistantName} />
    </>
  );
}

function Summary({ icon: Icon, title, value, detail, variant = "default" }: { icon: LucideIcon; title: string; value: string; detail: string; variant?: "default" | "primary" | "ai" | "muted" }) {
  return <article className={`metric-card ${variant}`}><div><span className="summary-icon"><Icon size={18} strokeWidth={1.8} /></span><strong>{title}</strong></div><p>{value}</p><small>{detail}</small></article>;
}

function FilterDrawer({ value, onChange, onClose }: { value: CustomerFilterState; onChange: (value: CustomerFilterState) => void; onClose: () => void }) {
  return <div className="drawer-backdrop">
    <button className="backdrop-dismiss" onClick={onClose} aria-label="关闭筛选" />
    <aside className="filter-drawer" aria-label="筛选待回复客户">
      <header><div><span>待回复客户</span><h2>筛选条件</h2></div><button onClick={onClose} aria-label="关闭筛选"><X size={18} /></button></header>
      <section><h3>意向程度</h3><div className="filter-options">{(["全部", "高", "中", "低"] as const).map((option) => <button key={option} className={value.intent === option ? "selected" : ""} onClick={() => onChange({ ...value, intent: option })}>{option === "全部" ? "全部客户" : `${option}意向`}</button>)}</div></section>
      <section><h3>客户阶段</h3><div className="filter-options">{["全部", "初步接触", "需求确认", "方案沟通", "样品测试"].map((option) => <button key={option} className={value.stage === option ? "selected" : ""} onClick={() => onChange({ ...value, stage: option })}>{option === "全部" ? "全部阶段" : option}</button>)}</div></section>
      <section><h3>分析状态</h3><div className="filter-options">{(["全部", "话术就绪", "分析完成", "正在分析", "待分析"] as const).map((option) => <button key={option} className={value.aiState === option ? "selected" : ""} onClick={() => onChange({ ...value, aiState: option })}>{option === "全部" ? "全部状态" : option}</button>)}</div></section>
      <footer><button onClick={() => onChange({ intent: "全部", stage: "全部", aiState: "全部" })}>重置</button><button className="primary-button" onClick={onClose}>应用筛选</button></footer>
    </aside>
  </div>;
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

function OverviewProfile({ customer, openCustomer, assistantName }: { customer: Customer | null; openCustomer: (id: string) => void; assistantName: string }) {
  if (!customer) {
    return <aside className="profile-panel empty" aria-label="客户画像"><h2>客户画像</h2><div className="profile-empty"><span className="empty-avatar"><UserRound size={30} /></span><strong>暂无客户数据</strong><p>出现待处理客户后，{assistantName}会自动展示优先客户画像。</p></div></aside>;
  }

  return (
    <aside className="profile-panel overview-profile" aria-label="今日重点客户画像">
      <div className="profile-heading"><div><span>客户画像</span><h2>今日重点客户</h2></div><Sparkles size={18} /></div>
      <div className="profile-hero"><b className="avatar large">{customer.initial}</b><div><strong>{customer.name}</strong><span>{customer.intent}意向</span><StageBadge stage={customer.stage} /></div></div>
      <section className="score-section"><span>成交评分</span><strong>{customer.confidence}</strong><div><i style={{ width: `${customer.confidence}%` }} /></div></section>
      <section className="profile-section"><span>核心需求</span><p>{customer.coreNeed}</p></section>
      <section className="profile-section"><span>最近动态</span><p>{customer.wait}前提出：{customer.latest}</p></section>
      <section className="advisor-judgment"><span><Sparkles size={15} /> {assistantName}下一步建议</span><p>{customer.aiSuggestion}</p></section>
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
  analysisRun: AnalysisRun;
  assistantName: string;
  renameAssistant: (name: string) => void;
  automationMode: AutomationMode;
  changeAutomationMode: (mode: AutomationMode) => void;
  advisorReply: string;
  updateAdvisorReply: (value: string) => void;
  sendAdvisorReply: () => void;
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  setNotice: (value: string) => void;
  chatRatio: number;
  startResize: (event: React.PointerEvent<HTMLButtonElement>) => void;
  detailsOpen: boolean;
  setDetailsOpen: (value: boolean) => void;
  returnToOverview: () => void;
};

function ConversationWorkspace(props: WorkspaceProps) {
  const { activeCustomer: customer } = props;
  const messageCount = props.chatMessages[customer.id]?.length ?? 0;
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [customer.id, messageCount]);

  return (
    <>
      <aside className="conversation-list" aria-label="客户会话列表">
        <div className="conversation-list-header"><h2>客户会话</h2><div><Link href="/search" aria-label="搜索会话"><Search size={16} /></Link><Link href="/customers?filter=1" aria-label="筛选客户"><SlidersHorizontal size={16} /></Link></div></div>
        <div className="conversation-items">
          {props.customers.map((item) => (
            <button key={item.id} className={`conversation-item ${item.id === props.activeId ? "selected" : ""}`} onClick={() => props.openCustomer(item.id)}>
              <b className="avatar">{item.initial}</b>
              <span><strong>{item.name}</strong><small>{props.drafts[item.id] ? <i>草稿</i> : item.latest}</small><em>{item.wait}</em></span>
              <UnreadBadge count={item.unread} dot={item.hasNewMessage && item.unread === 0} />
            </button>
          ))}
        </div>
      </aside>

      <div className="core-split" style={{ "--chat-ratio": `${props.chatRatio}%` } as React.CSSProperties}>
        <section className="chat-panel" aria-label="当前客户对话">
          <header className="chat-header">
            <div className="chat-header-main"><button className="back-workbench" onClick={props.returnToOverview}><ArrowLeft size={15} />返回工作台</button><div><h1>{customer.name}</h1><p>{customer.company} <span className="online-dot" /> 在线</p><StageBadge stage={customer.stage} /></div></div>
            <span className="auto-recording"><Sparkles size={13} />AI 自动记录中</span>
          </header>
          <div className="message-scroll">
            {(props.chatMessages[customer.id] ?? []).map((message) => (
              <div className={`message-line ${message.from}`} key={message.id}>
                <span className="message-meta">{message.from === "customer" ? customer.name : "我"} · {message.time}</span>
                <div className="bubble">{message.text}</div>
                {message.ai && <button className="ai-assisted" onClick={() => props.setNotice("可查看推荐原文、修改内容与推荐依据")}><Sparkles size={11} />{message.auto ? "AI 自动回复" : `${props.assistantName}话术`}</button>}
              </div>
            ))}
            <div className="new-divider"><span>以下为新消息</span></div>
            <div ref={messageEndRef} />
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
          <AIContent {...props} />
        </aside>
      </div>

      <ProfilePanel customer={customer} detailsOpen={props.detailsOpen} setDetailsOpen={props.setDetailsOpen} />
    </>
  );
}

function AIContent(props: WorkspaceProps) {
  const customer = props.activeCustomer;
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(props.assistantName);
  const lowConfidence = customer.confidence < 75;
  const autoEligible = props.automationMode === "auto" && customer.intent === "低";
  const modeCopy = props.automationMode === "auto"
    ? autoEligible
      ? "低意向客户已进入自动托管，新消息将由 AI 自动回复。"
      : "中高意向客户仍需确认后发送，避免高价值沟通误发。"
    : props.automationMode === "assist"
      ? `话术可直接编辑，确认后由${props.assistantName}发送。`
      : `${props.assistantName}不生成或发送话术，请在客户输入框中手动回复。`;
  function saveAssistantName() {
    props.renameAssistant(nameDraft);
    setNameDraft(nameDraft.trim().slice(0, 20) || defaultAssistantName);
    setRenaming(false);
  }
  return (
    <>
      <header className="ai-header">
        <div className="ai-title-block">
          {renaming ? <div className="assistant-name-editor"><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveAssistantName(); if (event.key === "Escape") { setNameDraft(props.assistantName); setRenaming(false); } }} maxLength={20} aria-label="AI 助手名称" /><button onClick={saveAssistantName} aria-label="保存助手名称"><Check size={13} /></button><button onClick={() => { setNameDraft(props.assistantName); setRenaming(false); }} aria-label="取消重命名"><X size={13} /></button></div> : <div className="assistant-name-heading"><h2>{props.assistantName}</h2><button onClick={() => { setNameDraft(props.assistantName); setRenaming(true); }} aria-label="重命名 AI 助手"><Pencil size={12} /></button></div>}
          <span>持续分析每条对话</span>
        </div>
        <div className="ai-header-actions">
          <strong className={lowConfidence ? "confidence low" : "confidence"}>可信度 {customer.confidence}</strong>
          <label className={`mode-selector mode-${props.automationMode}`}>
            <span className="sr-only">AI 回复模式</span>
            <select value={props.automationMode} onChange={(event) => props.changeAutomationMode(event.target.value as AutomationMode)} aria-label="AI 回复模式">
              {automationModes.map((mode) => <option value={mode.id} key={mode.id}>{mode.label}</option>)}
            </select>
            <ChevronDown size={13} aria-hidden="true" />
          </label>
        </div>
      </header>
      <div className="ai-scroll">
        <AgentProcess key={`${customer.id}-${props.analysisRun.version}`} customer={customer} run={props.analysisRun} />
        <section className={`mode-notice mode-${props.automationMode}`}><span>{automationModes.find((mode) => mode.id === props.automationMode)?.shortLabel}</span><p>{modeCopy}</p></section>
        {lowConfidence && <section className="uncertainty"><strong>不建议直接参考</strong><p>客户需求范围与采购信息不足，暂时无法准确判断价值。</p><ul><li>缺少具体采购品类</li><li>缺少预计用量</li><li>沟通时间尚未确认</li></ul></section>}
        <section className="analysis-pair"><div><span>客户意图</span><strong>{lowConfidence ? "需要补充确认" : "询价并索取产品资料"}</strong></div><div><span>客户价值</span><strong>{lowConfidence ? "暂不判断" : `${customer.intent}价值`}</strong></div></section>
        {props.automationMode !== "manual" && <section className="reply-card editable-reply"><div className="reply-heading"><h3>{lowConfidence ? "澄清式话术" : `${props.assistantName}推荐话术`}</h3><span>可直接编辑</span></div><textarea aria-label={`${props.assistantName}可编辑话术`} value={props.advisorReply} onChange={(event) => props.updateAdvisorReply(event.target.value)} />{autoEligible ? <div className="auto-reply-state"><span className="mini-spinner" />新消息到达后自动发送</div> : <button className="primary-button" disabled={!props.advisorReply.trim()} onClick={props.sendAdvisorReply}>确认发送</button>}</section>}
        {props.automationMode !== "manual" && !lowConfidence && <button className="alternative-row">查看 2 条备选话术 <ChevronDown size={15} /></button>}
        <section className="evidence"><h3>推荐依据</h3><ul><li>明确采购场景</li><li>主动询问规格与报价</li><li>关注交付能力</li></ul></section>
        <section className="task-card"><h3>自动跟进记录</h3><p>沟通总结与客户状态将在消息发送后自动更新。</p><div><button className="primary-button" onClick={() => props.setNotice("已打开本次 AI 跟进记录")}>查看记录</button><button onClick={() => props.setNotice("可在任务页查看待确认建议")}>任务建议</button></div></section>
      </div>
      <div className="ai-composer"><textarea value={props.aiPrompt} onChange={(event) => props.setAiPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); props.setNotice("AI 任务已提交"); props.setAiPrompt(""); } }} placeholder="向 AI 提问或下达任务…" aria-label="AI 指令输入" /><div><button onClick={() => { props.setAiPrompt(`${props.aiPrompt}（语音转写内容）`); props.setNotice("语音已转写，请确认后提交"); }} aria-label="AI 语音输入"><Mic size={17} /></button><button className="send-circle" onClick={() => { props.setNotice("AI 任务已提交"); props.setAiPrompt(""); }} aria-label="发送 AI 任务"><Send size={16} /></button></div></div>
    </>
  );
}

const agentSteps = [
  { title: "读取最新消息", detail: "已提取客户问题、时间和关键实体" },
  { title: "判断意图与价值", detail: "结合当前阶段更新意向与价值评分" },
  { title: "检索销售资料", detail: "匹配产品资料、历史跟进与知识库依据" },
  { title: "生成回复建议", detail: "形成可编辑话术并完成风险检查" },
];

function AgentProcess({ customer, run }: { customer: Customer; run: AnalysisRun }) {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const done = step >= agentSteps.length;

  useEffect(() => {
    const timers = agentSteps.map((_, index) => window.setTimeout(() => setStep(index + 1), 620 * (index + 1)));
    timers.push(window.setTimeout(() => setOpen(false), 3200));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className={`agent-process ${done ? "complete" : "running"}`}>
      <button className="agent-process-summary" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="agent-process-icon">{done ? <i className="continuous-loader" aria-hidden="true" /> : <Sparkles size={13} />}</span>
        <span className="agent-process-copy"><strong>{done ? "持续监听中" : "正在分析"}</strong><small>{done ? `已分析 ${run.total} 条消息 · 最近 ${run.time}` : `${agentSteps[Math.min(step, agentSteps.length - 1)].title} · ${step + 1}/${agentSteps.length}`}</small></span>
        <span className="agent-process-progress" aria-hidden="true"><i style={{ width: `${done ? 100 : ((step + 0.45) / agentSteps.length) * 100}%` }} /></span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="agent-process-details">
        <p>Agent 执行步骤 · 本轮分析：{run.source === "customer" ? "客户消息" : "销售回复"} · {run.time}</p>
        <blockquote className="agent-message-context">“{run.text}”</blockquote>
        <ol>{agentSteps.map((item, index) => {
          const finished = index < step;
          const active = !done && index === step;
          return <li className={finished ? "finished" : active ? "active" : "pending"} key={item.title}>
            <span>{finished ? <Check size={11} /> : active ? <i className="agent-step-spinner" /> : index + 1}</span>
            <div><strong>{item.title}</strong><small>{finished ? item.detail : active ? "正在处理…" : "等待执行"}</small></div>
          </li>;
        })}</ol>
        <div className="agent-process-stats"><span>当前客户：{customer.name}</span><span>累计分析：{run.total} 条消息</span></div>
        <small className="agent-process-note">展示的是可验证的执行步骤与结果，不包含模型内部隐性推理。</small>
      </div>}
    </section>
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
      <div className="profile-rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span>{label === "客户阶段" ? <StageBadge stage={value} /> : <strong>{value}</strong>}</div>)}</div>
      <button className="full-profile" onClick={() => setDetailsOpen(true)}>查看完整资料</button>
      {detailsOpen && <div className="details-drawer"><header><div><span>客户详情</span><h2>{customer.name}</h2></div><button onClick={() => setDetailsOpen(false)} aria-label="关闭客户详情"><X size={18} /></button></header><section><h3>联系方式</h3><p>企业微信已连接</p><h3>客户画像</h3><p>{customer.coreNeed}，重点关注{customer.concern}。</p><h3>历史跟进</h3><p>最近互动：{customer.lastInteraction}</p><h3>购买记录</h3><p>暂无成交记录</p><h3>关联商机</h3><p>{customer.name} · 年度采购</p><h3>文件资料</h3><p>产品介绍.pdf · 规格说明.xlsx</p></section></div>}
    </aside>
  );
}
