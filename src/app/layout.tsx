import type { Metadata } from "next";

import MainNav from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/utils/cn";
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
    <html lang="en">
      <body className={cn("flex items-center justify-center", inter.className)}>
        <Providers>
          <div className="flex h-screen w-screen max-w-screen-2xl ">
            <MainNav />
            <div className="z-0 flex w-full pt-32">{children}</div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
