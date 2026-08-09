"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Boxes, BriefcaseBusiness, FileText, Search, Sparkles } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";
import { knowledgeItems, opportunityItems, productItems } from "../workspace-data";

type ToolTab = "opportunities" | "products" | "knowledge";

export default function ToolsPage() {
  const [tab, setTab] = useState<ToolTab>("opportunities");
  const [query, setQuery] = useState("");
  return <SecondaryShell active="tools" eyebrow="业务工具" title="销售资源中心" description="集中管理商机、产品与知识库，让 Advisor 获得可靠业务上下文" actions={<label className="header-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索资源" /></label>}>
    <section className="tool-overview"><button className={tab === "opportunities" ? "active" : ""} onClick={() => setTab("opportunities")}><BriefcaseBusiness size={20} /><div><strong>商机</strong><span>按销售阶段查看商机看板</span></div><em>{opportunityItems.length}</em></button><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}><Boxes size={20} /><div><strong>产品</strong><span>产品分类与 AI 推荐资料</span></div><em>{productItems.length}</em></button><button className={tab === "knowledge" ? "active" : ""} onClick={() => setTab("knowledge")}><BookOpen size={20} /><div><strong>知识库</strong><span>话术、案例、FAQ 与画像</span></div><em>{knowledgeItems.length}</em></button></section>
    {tab === "opportunities" && <section className="tool-content"><header><div><h2>商机看板</h2><span>按当前销售阶段推进重点机会</span></div><button>查看全部商机 <ArrowRight size={14} /></button></header><div className="opportunity-board">{["需求确认", "方案沟通", "样品测试"].map((stage) => <section key={stage}><header><strong>{stage}</strong><span>{opportunityItems.filter((item) => item.stage === stage).length}</span></header>{opportunityItems.filter((item) => item.stage === stage && `${item.name}${item.customer}`.includes(query)).map((item) => <article key={item.name}><span>{item.customer}</span><h3>{item.name}</h3><strong>{item.amount}</strong><div><i style={{ width: `${item.probability}%` }} /><span>{item.probability}%</span></div><button>查看商机</button></article>)}</section>)}</div></section>}
    {tab === "products" && <section className="tool-content"><header><div><h2>产品中心</h2><span>根据当前客户需求选择产品与解决方案</span></div><button><Sparkles size={14} />让 AI 推荐产品</button></header><div className="product-grid">{productItems.filter((item) => `${item.name}${item.category}${item.description}`.includes(query)).map((item) => <article key={item.name}><span className="resource-icon"><Boxes size={20} /></span><em>{item.category}</em><h3>{item.name}</h3><p>{item.description}</p><footer><span>{item.count}</span><button>查看资料 <ArrowRight size={13} /></button></footer></article>)}</div></section>}
    {tab === "knowledge" && <section className="tool-content"><header><div><h2>知识库</h2><span>产品资料、销售话术、客户案例、制度与画像</span></div><button>上传资料</button></header><div className="knowledge-list">{knowledgeItems.filter((item) => `${item.title}${item.type}`.includes(query)).map((item) => <article key={item.title}><span className="resource-icon"><FileText size={18} /></span><div><strong>{item.title}</strong><span>{item.type} · {item.updated}</span></div><em>{item.uses} 次引用</em><button>打开</button></article>)}</div></section>}
  </SecondaryShell>;
}
