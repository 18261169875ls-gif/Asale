import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asale · 销售辅助系统",
  description: "面向一线销售的实时 AI 客户沟通工作台。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
