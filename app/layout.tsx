import type { Metadata } from "next";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bangunan Pro - Material & Kontraktor",
  description: "Website bisnis material dan kontraktor dengan admin panel, order, invoice, supplier, dan portofolio."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
