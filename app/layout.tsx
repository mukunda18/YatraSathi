import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YatraSathi",
  description: "Your perfect travel companion",
};

import { Toaster } from "sonner";
import LocationWatcher from "@/components/location/LocationWatcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-black text-white selection:bg-white/10">
      <body className={`antialiased h-full overflow-x-hidden`}>
        <Toaster position="top-center" richColors theme="dark" />
        <LocationWatcher />
        {children}
      </body>
    </html>
  );
}
