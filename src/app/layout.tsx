import type { Metadata } from "next";

import MainNav from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  authors: [
    {
      name: "",
      url: ""
    }
  ],
  creator: "",
  description: "",
  icons: {
    icon: "/favicon.ico"
  },
  keywords: [],
  title: "Weave"
  // manifest: `${siteConfig.url}/site.webmanifest`
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <div className="flex h-screen w-full flex-col items-center px-[6vw] py-[3vh]">
          <div className="flex h-full max-h-[55rem] max-w-[95rem] flex-col">
            <MainNav />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
