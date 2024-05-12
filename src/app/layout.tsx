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
    description: "find time for what's important.",
    images: [
      {
        height: 512,
        url: "android-chrome-512x512.png",
        width: 512
      },
      {
        height: 192,
        url: "android-chrome-192x192.png",
        width: 192
      },
      {
        height: 180,
        url: "apple-touch-icon.png",
        width: 180
      }
    ],
    locale: "en-US",
    title: "Weave"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <Providers>
          <div className="flex h-screen w-full flex-col items-center">
            <div className="fixed z-50 w-[66rem] 2xl:w-[84rem]">
              <MainNav />
            </div>
            <div className="z-0 flex max-h-[54rem] w-full origin-top scale-[80%] justify-center pt-32 2xl:scale-100">
              {children}
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
