import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentica",
  description: "AI-native ecommerce powered by agents and MCP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
