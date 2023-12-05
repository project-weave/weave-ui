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
        <div className="flex w-full flex-col items-center px-[10vw]">
          <div className="fixed z-50  w-[66rem] 2xl:w-[84rem]">
            <MainNav />
          </div>
          <div className="z-0 flex max-h-[50rem] w-full scale-[80%] justify-center py-2 2xl:mt-[5rem] 2xl:scale-100">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
