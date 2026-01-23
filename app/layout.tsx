import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YatraSathi",
  description: "Your perfect travel companion",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0a0f18] text-slate-200 selection:bg-indigo-500/30">
      <body className={`antialiased h-full overflow-x-hidden`}>
        <Toaster position="top-center" richColors theme="dark" />
        {children}
      </body>
    </html>
  );
}
