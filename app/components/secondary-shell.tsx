"use client";

import { useState, type ReactNode } from "react";
import { GlobalNav, type NavId } from "./global-nav";

export function SecondaryShell({
  active,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  active: NavId;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <main className={`secondary-shell ${expanded ? "nav-expanded" : "nav-collapsed"}`}>
      <GlobalNav expanded={expanded} active={active} onToggle={() => setExpanded((value) => !value)} />
      <section className="secondary-page">
        <header className="secondary-header">
          <div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>
          {actions && <div className="secondary-actions">{actions}</div>}
        </header>
        {children}
      </section>
    </main>
  );
}
