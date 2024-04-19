import type { Metadata } from "next";

import MainNav from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils/cn";
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
        <div className="flex h-screen w-full flex-col items-center">
          <div className="fixed z-50 w-[66rem] 2xl:w-[84rem]">
            <MainNav />
          </div>
          <div className="z-0 flex max-h-[54rem] w-full origin-top scale-[80%] justify-center pt-32 2xl:scale-100">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
