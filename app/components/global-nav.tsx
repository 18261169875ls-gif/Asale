"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  CalendarDays,
  CircleUserRound,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  SquareCheckBig,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavId = "messages" | "search" | "customers" | "tasks" | "calendar" | "tools" | "profile";

const navItems: Array<{ id: NavId; label: string; href: string; icon: LucideIcon }> = [
  { id: "messages", label: "消息", href: "/", icon: MessageSquare },
  { id: "search", label: "搜索", href: "/search", icon: Search },
  { id: "customers", label: "客户", href: "/customers", icon: Users },
  { id: "tasks", label: "任务", href: "/tasks", icon: SquareCheckBig },
  { id: "calendar", label: "日程", href: "/calendar", icon: CalendarDays },
  { id: "tools", label: "业务工具", href: "/tools", icon: Boxes },
];

export function GlobalNav({
  expanded,
  active,
  onToggle,
  onNewConversation,
}: {
  expanded: boolean;
  active: NavId;
  onToggle?: () => void;
  onNewConversation?: () => void;
}) {
  return (
    <aside className="global-nav" aria-label="全局导航">
      <div className="brand-block">
        <Image
          className={expanded ? "brand-wordmark" : "brand-icon"}
          src={expanded ? "/brand/asale-wordmark.png" : "/brand/asale-icon.png"}
          alt="Asale"
          width={expanded ? 164 : 40}
          height={expanded ? 58 : 40}
          priority
        />
        {expanded && <><span>信息予你无限，<br />Asale与你重筑未来</span><small>示例企业</small></>}
      </div>
      {expanded && <Link className="new-chat" href="/" onClick={onNewConversation}><Plus size={17} />新对话</Link>}
      <nav>
        {navItems.map(({ id, label, href, icon: Icon }) => (
          <Link key={id} href={href} className={active === id ? "active" : ""} aria-label={label} title={label}>
            <span className="nav-icon"><Icon size={18} strokeWidth={1.8} /></span>{expanded && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      <div className="nav-bottom">
        <Link href="/profile" className={active === "profile" ? "active" : ""} aria-label="我的" title="我的">
          <span className="nav-icon"><CircleUserRound size={18} /></span>{expanded && <span>我的</span>}
        </Link>
        {onToggle && <button aria-label={expanded ? "收起导航" : "展开导航"} onClick={onToggle}>
          <span className="nav-icon">{expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}</span>{expanded && <span>收起</span>}
        </button>}
      </div>
    </aside>
  );
}
