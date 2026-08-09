"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Filter, MessageSquare, Search, SlidersHorizontal, X } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";
import { StageBadge, UnreadBadge } from "../components/status-badges";
import { initialCustomers, type Customer } from "../demo-data";

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<"全部" | Customer["intent"]>("全部");
  const [stage, setStage] = useState("全部");
  const [selectedId, setSelectedId] = useState(initialCustomers[0].id);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const customers = useMemo(() => initialCustomers.filter((customer) =>
    `${customer.name}${customer.company}${customer.latest}${customer.coreNeed}`.includes(query.trim())
      && (intent === "全部" || customer.intent === intent)
      && (stage === "全部" || customer.stage === stage),
  ), [query, intent, stage]);
  const selected = initialCustomers.find((customer) => customer.id === selectedId) ?? customers[0] ?? null;

  return <SecondaryShell active="customers" eyebrow="客户管理" title="全部客户" description="查看客户状态、AI 判断和完整跟进上下文" actions={<><Link className="secondary-button" href="/search"><Search size={15} />全局搜索</Link><button className="primary-action" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={15} />筛选客户</button></>}>
    <div className="workspace-toolbar">
      <label className="wide-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索客户名称、公司、需求或最近消息" /></label>
      <div className="toolbar-chips"><span>当前范围</span><button className={intent !== "全部" ? "active" : ""} onClick={() => setFiltersOpen(true)}>{intent === "全部" ? "全部意向" : `${intent}意向`}</button><button className={stage !== "全部" ? "active" : ""} onClick={() => setFiltersOpen(true)}>{stage === "全部" ? "全部阶段" : stage}</button></div>
    </div>
    <div className="customers-page-grid">
      <section className="customer-directory">
        <header><div><h2>客户列表</h2><span>{customers.length} 位客户</span></div><button onClick={() => setFiltersOpen(true)}><Filter size={15} />筛选</button></header>
        <div className="directory-head"><span>客户</span><span>阶段</span><span>意向 / 价值</span><span>最近互动</span></div>
        <div className="directory-list">
          {customers.map((customer) => <button key={customer.id} className={selected?.id === customer.id ? "selected" : ""} onClick={() => setSelectedId(customer.id)}>
            <span className="directory-customer"><b className="avatar small">{customer.initial}</b><span><strong>{customer.name}</strong><small>{customer.latest}</small></span><UnreadBadge count={customer.unread} /></span>
            <StageBadge stage={customer.stage} />
            <span className="directory-intent"><em className={`intent-badge intent-${customer.intent === "高" ? "high" : customer.intent === "中" ? "medium" : "low"}`}>{customer.intent}意向</em><small>价值 {customer.value}</small></span>
            <span className="directory-time">{customer.lastInteraction}<ArrowRight size={14} /></span>
          </button>)}
          {!customers.length && <div className="section-empty"><strong>没有符合条件的客户</strong><span>尝试清除筛选条件或更换关键词。</span></div>}
        </div>
      </section>
      <aside className="customer-detail-card">
        {selected ? <><header><div className="avatar large">{selected.initial}</div><div><h2>{selected.name}</h2><span>{selected.company}</span></div></header>
          <div className="detail-badges"><StageBadge stage={selected.stage} /><em className={`intent-badge intent-${selected.intent === "高" ? "high" : selected.intent === "中" ? "medium" : "low"}`}>{selected.intent}意向</em><strong>价值 {selected.value}</strong></div>
          <section><span>核心需求</span><p>{selected.coreNeed}</p></section><section><span>关键关注</span><p>{selected.concern}</p></section><section><span>Advisor 判断</span><p>{selected.aiSuggestion}</p></section><section><span>下一步建议</span><p>{selected.nextStep}</p></section>
          <div className="detail-actions"><Link className="primary-action" href="/"><MessageSquare size={15} />进入消息工作台</Link><button>查看完整资料</button></div>
        </> : <div className="section-empty"><strong>选择客户查看详情</strong></div>}
      </aside>
    </div>
    {filtersOpen && <div className="drawer-backdrop"><button className="backdrop-dismiss" onClick={() => setFiltersOpen(false)} aria-label="关闭筛选" /><aside className="filter-drawer"><header><div><span>客户管理</span><h2>筛选客户</h2></div><button onClick={() => setFiltersOpen(false)} aria-label="关闭"><X size={18} /></button></header><section><h3>意向程度</h3><div className="filter-options">{(["全部", "高", "中", "低"] as const).map((option) => <button className={intent === option ? "selected" : ""} key={option} onClick={() => setIntent(option)}>{option === "全部" ? "全部意向" : `${option}意向`}</button>)}</div></section><section><h3>客户阶段</h3><div className="filter-options">{["全部", "初步接触", "需求确认", "方案沟通", "样品测试"].map((option) => <button className={stage === option ? "selected" : ""} key={option} onClick={() => setStage(option)}>{option === "全部" ? "全部阶段" : option}</button>)}</div></section><footer><button onClick={() => { setIntent("全部"); setStage("全部"); }}>重置</button><button className="primary-button" onClick={() => setFiltersOpen(false)}>应用筛选</button></footer></aside></div>}
  </SecondaryShell>;
}
