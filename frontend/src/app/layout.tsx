import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Observability Platform",
  description: "Realtime AI Agent execution tracing and observability console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
