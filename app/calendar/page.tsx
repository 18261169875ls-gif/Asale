"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Plus, X } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";
import { scheduleItems } from "../workspace-data";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState("今天");
  const [items, setItems] = useState(scheduleItems);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const visible = useMemo(() => items.filter((item) => item.date === selectedDate), [items, selectedDate]);
  const days = [
    { weekday: "一", date: "11", label: "昨天" }, { weekday: "二", date: "12", label: "今天" }, { weekday: "三", date: "13", label: "明天" },
    { weekday: "四", date: "14", label: "周四" }, { weekday: "五", date: "15", label: "周五" }, { weekday: "六", date: "16", label: "周六" }, { weekday: "日", date: "17", label: "周日" },
  ];
  function addSchedule() { if (!title.trim()) return; setItems((current) => [...current, { id: `s-${Date.now()}`, time: "16:00", title: title.trim(), type: "客户预约", customer: "待关联", date: selectedDate, location: "Asale 页面内" }]); setTitle(""); setCreating(false); }

  return <SecondaryShell active="calendar" eyebrow="日程管理" title="日程" description="统一查看客户预约、跟进提醒、任务截止时间和会议" actions={<button className="primary-action" onClick={() => setCreating(true)}><Plus size={16} />新建日程</button>}>
    <section className="calendar-toolbar"><div><button aria-label="上一周"><ChevronLeft size={17} /></button><strong>2026 年 8 月</strong><button aria-label="下一周"><ChevronRight size={17} /></button></div><button onClick={() => setSelectedDate("今天")}>回到今天</button></section>
    <section className="week-strip">{days.map((day) => <button key={day.label} className={selectedDate === day.label ? "active" : ""} onClick={() => setSelectedDate(day.label)}><span>周{day.weekday}</span><strong>{day.date}</strong><em>{day.label}</em></button>)}</section>
    <div className="calendar-layout"><section className="agenda-panel"><header><div><h2>{selectedDate}的日程</h2><span>{visible.length} 项安排</span></div><CalendarDays size={18} /></header><div className="agenda-list">{visible.map((item) => <article key={item.id}><time>{item.time}</time><span className="agenda-line" /><div><div><em>{item.type}</em><strong>{item.title}</strong></div><p>{item.customer}</p><span><MapPin size={13} />{item.location}</span></div><button>查看详情</button></article>)}{!visible.length && <div className="section-empty"><strong>当天暂无日程</strong><span>可以新建客户预约、提醒或会议。</span></div>}</div></section><aside className="day-summary"><h2>今日概览</h2><div><Clock3 size={18} /><span>下一项日程</span><strong>09:30</strong><p>新禾食品方案确认会</p></div><section><span>日程类型</span><p><i className="dot primary" />客户会议 <strong>1</strong></p><p><i className="dot warning" />跟进提醒 <strong>1</strong></p><p><i className="dot success" />客户预约 <strong>1</strong></p></section><button onClick={() => setCreating(true)}>快速添加提醒</button></aside></div>
    {creating && <div className="modal-backdrop"><section className="compact-modal"><header><div><span>日程管理</span><h2>新建日程</h2></div><button onClick={() => setCreating(false)} aria-label="关闭"><X size={18} /></button></header><label>日程标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：客户方案确认会" /></label><div className="modal-grid"><label>日期<input value={selectedDate} readOnly /></label><label>时间<input value="16:00" readOnly /></label></div><label>日程类型<select defaultValue="客户预约"><option>客户预约</option><option>跟进提醒</option><option>任务截止</option><option>会议</option></select></label><footer><button onClick={() => setCreating(false)}>取消</button><button className="primary-action" onClick={addSchedule}>创建日程</button></footer></section></div>}
  </SecondaryShell>;
}
