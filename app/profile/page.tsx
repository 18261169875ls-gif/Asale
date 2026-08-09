"use client";

import { useEffect, useState } from "react";
import { Bell, Bot, Check, ChevronRight, CircleUserRound, LockKeyhole, SlidersHorizontal, Sparkles } from "lucide-react";
import { SecondaryShell } from "../components/secondary-shell";

type ProfileTab = "profile" | "portrait" | "notifications" | "ai" | "permissions";

const tabs = [
  { id: "profile" as const, label: "个人资料", icon: CircleUserRound },
  { id: "portrait" as const, label: "销售画像", icon: Sparkles },
  { id: "notifications" as const, label: "通知设置", icon: Bell },
  { id: "ai" as const, label: "AI 偏好", icon: Bot },
  { id: "permissions" as const, label: "账号与权限", icon: LockKeyhole },
];

const modes = [
  { id: "auto", title: "AI 全自动", description: "低意向客户自动回复；中高意向仍需确认。" },
  { id: "assist", title: "AI 半自动", description: "生成可编辑话术，确认后发送。" },
  { id: "manual", title: "纯手动回复", description: "由销售在客户消息输入框中自行回复。" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState("assist");
  const [assistantName, setAssistantName] = useState("Advisor 助手");
  const [notifications, setNotifications] = useState({ messages: true, tasks: true, calendar: true, ai: true });

  useEffect(() => {
    const stored = window.localStorage.getItem("asale-automation-mode");
    const storedName = window.localStorage.getItem("asale-assistant-name")?.trim();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(stored);
    }
    if (storedName) {
      setAssistantName(storedName);
    }
  }, []);

  function save() {
    const nextName = assistantName.trim().slice(0, 20) || "Advisor 助手";
    setAssistantName(nextName);
    window.localStorage.setItem("asale-automation-mode", mode);
    window.localStorage.setItem("asale-assistant-name", nextName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return <SecondaryShell active="profile" eyebrow="个人中心" title="我的" description="管理个人资料、销售画像、通知、AI 偏好与账号权限" actions={<button className="primary-action" onClick={save}>{saved ? <><Check size={15} />已保存</> : "保存设置"}</button>}>
    <div className="profile-settings-layout">
      <aside className="settings-nav">
        <header><span className="profile-avatar">刘</span><div><strong>刘建</strong><p>销售顾问 · 示例企业</p></div></header>
        <nav>{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={17} /><span>{label}</span><ChevronRight size={14} /></button>)}</nav>
      </aside>
      <section className="settings-content">
        {tab === "profile" && <><header><h2>个人资料</h2><p>这些信息会用于销售协作、任务分配和客户跟进记录。</p></header><div className="settings-form"><label>姓名<input defaultValue="刘建" /></label><label>职位<input defaultValue="销售顾问" /></label><label>所属企业<input defaultValue="示例企业" disabled /></label><label>手机号码<input defaultValue="138 **** 6886" /></label><label>企业邮箱<input defaultValue="liujian@example.com" /></label><label>负责区域<input defaultValue="华东区域" /></label></div></>}

        {tab === "portrait" && <><header><h2>销售画像</h2><p>{assistantName}根据近期客户沟通、任务完成与话术表现生成。</p></header><div className="portrait-score"><div><span>综合表现</span><strong>86</strong><p>超过团队 72% 的销售顾问</p></div><section><p><span>客户响应效率</span><strong>92</strong></p><p><span>高意向推进能力</span><strong>84</strong></p><p><span>话术采纳质量</span><strong>81</strong></p><p><span>任务按时完成率</span><strong>88</strong></p></section></div><div className="portrait-insights"><article><Sparkles size={17} /><div><strong>优势</strong><p>客户响应及时，擅长快速识别明确采购需求。</p></div></article><article><SlidersHorizontal size={17} /><div><strong>提升建议</strong><p>方案沟通阶段可更早确认采购规模与决策周期。</p></div></article></div></>}

        {tab === "notifications" && <><header><h2>通知设置</h2><p>选择需要在 Asale 页面内接收的提醒。</p></header><div className="settings-list">{([
          ["messages", "客户新消息", "新消息、未读数量和紧急客户提醒"],
          ["tasks", "任务提醒", "逾期、即将截止和 AI 任务建议"],
          ["calendar", "日程提醒", "客户预约、会议和跟进提醒"],
          ["ai", `${assistantName}提醒`, "自动回复结果、低可信度与风险提示"],
        ] as const).map(([id, title, description]) => <article key={id}><div><strong>{title}</strong><p>{description}</p></div><button className={`switch ${notifications[id] ? "on" : ""}`} onClick={() => setNotifications((current) => ({ ...current, [id]: !current[id] }))} aria-label={`切换${title}`}><span /></button></article>)}</div></>}

        {tab === "ai" && <><header><h2>AI 偏好</h2><p>设置助手称呼和默认回复模式。客户会话内仍可临时调整。</p></header><label className="assistant-name-setting"><span>助手名称</span><input value={assistantName} onChange={(event) => setAssistantName(event.target.value)} maxLength={20} placeholder="Advisor 助手" /><small>将同步显示在消息工作台和 AI 辅助区域。</small></label><div className="mode-choice-list">{modes.map((item) => <button key={item.id} className={mode === item.id ? "selected" : ""} onClick={() => setMode(item.id)}><span>{mode === item.id && <Check size={14} />}</span><div><strong>{item.title}</strong><p>{item.id === "assist" ? `${assistantName || "AI 助手"}${item.description}` : item.description}</p></div></button>)}</div><section className="ai-preference-note"><Bot size={18} /><div><strong>安全边界</strong><p>低于 75 分的判断不会直接用于自动决策，系统仅生成澄清式话术。</p></div></section></>}

        {tab === "permissions" && <><header><h2>账号与权限</h2><p>查看当前账号、数据范围和企业微信连接状态。</p></header><div className="settings-list"><article><div><strong>账号角色</strong><p>一线销售人员</p></div><span>标准权限</span></article><article><div><strong>客户数据范围</strong><p>本人负责及协作客户</p></div><span>126 位客户</span></article><article><div><strong>企业微信</strong><p>消息与客户身份连接</p></div><span className="connected">已连接</span></article><article><div><strong>登录设备</strong><p>Windows / Mac 浏览器</p></div><button className="secondary-button">管理设备</button></article></div></>}
      </section>
    </div>
  </SecondaryShell>;
}
