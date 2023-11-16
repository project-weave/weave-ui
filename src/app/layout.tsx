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
        <div className="w-full px-[5vw] py-[4vh]">
          <MainNav />
          {children}
        </div>
      </body>
    </html>
  );
}
