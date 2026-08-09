import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asale · 信息予你无限，Asale与你重筑未来",
  description: "面向一线销售的实时 AI 客户沟通工作台。",
  icons: {
    icon: [{ url: "/brand/asale-icon.png", type: "image/png" }],
    shortcut: "/brand/asale-icon.png",
    apple: "/brand/asale-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
