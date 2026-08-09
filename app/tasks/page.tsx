"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Clock3, Plus, Search, Sparkles, X } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";
import { initialTasks, type SalesTask, type TaskStatus } from "../workspace-data";

const tabs: Array<"全部" | TaskStatus> = ["全部", "逾期", "今天", "未来", "已完成"];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [tab, setTab] = useState<"全部" | TaskStatus>("今天");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const visible = useMemo(() => tasks.filter((task) => (tab === "全部" || task.status === tab) && `${task.title}${task.customer}`.includes(query.trim())), [tasks, tab, query]);
  const counts = Object.fromEntries(tabs.map((item) => [item, item === "全部" ? tasks.length : tasks.filter((task) => task.status === item).length]));

  function completeTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: "已完成" } : task));
  }

  function addTask() {
    if (!title.trim()) return;
    const task: SalesTask = { id: `task-${Date.now()}`, title: title.trim(), customer: customer.trim() || "个人任务", due: "今天 18:00", status: "今天", priority: "中", source: "手动创建" };
    setTasks((current) => [task, ...current]); setTitle(""); setCustomer(""); setCreating(false); setTab("今天");
  }

  return <SecondaryShell active="tasks" eyebrow="任务中心" title="任务" description="按时间状态管理客户跟进、AI 建议与个人任务" actions={<button className="primary-action" onClick={() => setCreating(true)}><Plus size={16} />新建任务</button>}>
    <section className="task-summary-grid"><article className="danger"><CircleAlert size={19} /><div><strong>{counts["逾期"]}</strong><span>逾期任务</span></div></article><article className="primary"><Clock3 size={19} /><div><strong>{counts["今天"]}</strong><span>今日任务</span></div></article><article><Sparkles size={19} /><div><strong>{tasks.filter((task) => task.source === "AI 建议" && task.status !== "已完成").length}</strong><span>AI 建议待处理</span></div></article><article><Check size={19} /><div><strong>{counts["已完成"]}</strong><span>已完成</span></div></article></section>
    <section className="tasks-panel">
      <header><div className="status-tabs">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}<span>{counts[item]}</span></button>)}</div><label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务" /></label></header>
      <div className="task-list">{visible.map((task) => <article key={task.id} className={task.status === "已完成" ? "completed" : ""}><button className="task-check" onClick={() => completeTask(task.id)} aria-label={`完成${task.title}`}>{task.status === "已完成" && <Check size={14} />}</button><div className="task-main"><div><strong>{task.title}</strong><em className={`priority-${task.priority}`}>{task.priority}优先级</em>{task.source === "AI 建议" && <span><Sparkles size={11} />AI 建议</span>}</div><p>{task.customer}</p></div><div className={`task-due ${task.status === "逾期" ? "overdue" : ""}`}><span>{task.status}</span><strong>{task.due}</strong></div><button className="task-more">···</button></article>)}{!visible.length && <div className="section-empty"><strong>当前分类暂无任务</strong><span>切换其他状态或新建任务。</span></div>}</div>
    </section>
    {creating && <div className="modal-backdrop"><section className="compact-modal"><header><div><span>任务中心</span><h2>新建任务</h2></div><button onClick={() => setCreating(false)} aria-label="关闭"><X size={18} /></button></header><label>任务内容<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：发送产品方案并确认用量" /></label><label>关联客户<input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="客户名称，可选" /></label><div className="modal-grid"><label>截止时间<input value="今天 18:00" readOnly /></label><label>优先级<select defaultValue="中"><option>高</option><option>中</option><option>低</option></select></label></div><footer><button onClick={() => setCreating(false)}>取消</button><button className="primary-action" onClick={addTask}>创建任务</button></footer></section></div>}
  </SecondaryShell>;
}
