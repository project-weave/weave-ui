import type { Metadata } from "next";

import MainNav from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils/cn";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        alt: "Weave Logo",
        height: 630,
        type: "image/png",
        url: "https://weave-chi.vercel.app/link-preview.png",
        width: 1200
      }
    ],
    locale: "en-US",
    title: "Weave | find time for what's important",
    type: "website",
    url: "https://weave-chi.vercel.app"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className="overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-light sm:scrollbar-w-6"
      lang="en"
    >
      <body className={cn("relative flex items-center justify-center ", inter.className)}>
        <Analytics />
        <Providers>
          <div className="flex h-screen w-full max-w-[85rem]">
            <MainNav />
            <div className="pt-18 z-0 w-full pt-20 2xl:pt-24 ">{children}</div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
