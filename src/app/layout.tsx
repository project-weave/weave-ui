import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import MainNav from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils/cn";

import "./globals.css";
import Providers from "./providers";

const inter = Inter({ display: "swap", subsets: ["latin"], variable: "--font-sans" });

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
    <html className={inter.variable} lang="en">
      <body className={cn("relative flex items-center justify-center font-sans")} suppressHydrationWarning>
        <Analytics />
        <Providers>
          <div className="mx-auto flex w-full max-w-[85rem]">
            <MainNav />
            <div className="w-full pt-[3.25rem] md:pt-[3.75rem]">{children}</div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
