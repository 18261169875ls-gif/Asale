"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock3, FileText, Search, SquareCheckBig, Users, X } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";
import { StageBadge } from "../components/status-badges";
import { initialCustomers } from "../demo-data";
import { initialTasks, knowledgeItems, productItems } from "../workspace-data";

type SearchType = "全部" | "客户" | "任务" | "知识库";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("全部");
  const normalized = query.trim();
  const result = useMemo(() => ({
    customers: initialCustomers.filter((item) => `${item.name}${item.company}${item.latest}${item.coreNeed}`.includes(normalized)),
    tasks: initialTasks.filter((item) => `${item.title}${item.customer}${item.status}`.includes(normalized)),
    knowledge: [...knowledgeItems, ...productItems.map((item) => ({ title: item.name, type: item.category, updated: item.count, uses: 0 }))].filter((item) => `${item.title}${item.type}`.includes(normalized)),
  }), [normalized]);
  const total = result.customers.length + result.tasks.length + result.knowledge.length;
  const show = (item: SearchType) => type === "全部" || type === item;

  return <SecondaryShell active="search" eyebrow="全局搜索" title="搜索" description="跨客户、消息、任务、产品和知识资料快速定位信息">
    <section className="search-hero"><Search size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索客户名称、需求、任务或知识资料" />{query && <button onClick={() => setQuery("")} aria-label="清除搜索"><X size={17} /></button>}<kbd>Enter</kbd></section>
    <div className="search-filters">{(["全部", "客户", "任务", "知识库"] as const).map((item) => <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>{item}</button>)}<span>{normalized ? `找到 ${total} 条结果` : "输入关键词开始搜索"}</span></div>
    {!normalized ? <section className="search-start"><div><Clock3 size={18} /><h2>最近搜索</h2><div>{["高意向客户", "茶基底方案", "今日逾期任务"].map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></div><div><BookOpen size={18} /><h2>建议搜索</h2><p>可以搜索客户名称、最近消息、核心需求、任务内容、产品名称和知识库类型。</p></div></section> : <div className="search-results">
      {show("客户") && <section><header><div><Users size={17} /><h2>客户</h2><span>{result.customers.length}</span></div><Link href="/customers">查看全部 <ArrowRight size={13} /></Link></header>{result.customers.map((customer) => <Link href="/customers" key={customer.id}><span className="avatar small">{customer.initial}</span><div><strong>{customer.name}</strong><p>{customer.latest}</p></div><StageBadge stage={customer.stage} /><em>{customer.intent}意向 · 价值 {customer.value}</em></Link>)}{!result.customers.length && <p className="result-empty">没有匹配的客户</p>}</section>}
      {show("任务") && <section><header><div><SquareCheckBig size={17} /><h2>任务</h2><span>{result.tasks.length}</span></div><Link href="/tasks">查看全部 <ArrowRight size={13} /></Link></header>{result.tasks.map((task) => <Link href="/tasks" key={task.id}><span className="result-type">{task.status}</span><div><strong>{task.title}</strong><p>{task.customer} · {task.due}</p></div><em>{task.priority}优先级</em></Link>)}{!result.tasks.length && <p className="result-empty">没有匹配的任务</p>}</section>}
      {show("知识库") && <section><header><div><FileText size={17} /><h2>知识与产品</h2><span>{result.knowledge.length}</span></div><Link href="/tools">查看全部 <ArrowRight size={13} /></Link></header>{result.knowledge.map((item) => <Link href="/tools" key={`${item.type}-${item.title}`}><span className="resource-icon"><FileText size={16} /></span><div><strong>{item.title}</strong><p>{item.type} · {item.updated}</p></div><em>打开</em></Link>)}{!result.knowledge.length && <p className="result-empty">没有匹配的知识资料</p>}</section>}
    </div>}
  </SecondaryShell>;
}
