"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const LINK =
  "rounded-md text-[13px] text-text-light transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Top bar on every page: the Weave wordmark (stand-in until there's a new logo), two info links and
 * Log in (not built yet: they say "Coming soon"), and Create a Weave.
 */
export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const isHome = pathname === "/";

  function comingSoon() {
    toast({ description: "Coming soon", duration: 2000 });
  }

  // on the home page it jumps to the form; anywhere else it goes home
  function createAWeave() {
    if (!isHome) return router.push("/");
    const form = document.getElementById("new-event-form");
    form?.scrollIntoView({ behavior: "smooth", block: "center" });
    form?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
  }

  return (
    <nav aria-label="Main navigation" className="absolute inset-x-0 top-0 z-50 h-[3.25rem] md:h-[3.75rem]">
      {/* same side padding and 82rem width as the page content, so the wordmark lines up with the cards */}
      <div className="h-full w-full px-6 sm:px-8 lg:px-5">
        <div className="mx-auto flex h-full w-full max-w-[82rem] items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              aria-label="Weave home"
              className="rounded-md text-lg font-semibold tracking-tight text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/"
            >
              Weave
            </Link>
            <div className="hidden items-center gap-5 sm:flex">
              <button className={LINK} onClick={comingSoon} type="button">
                Our story
              </button>
              <button className={LINK} onClick={comingSoon} type="button">
                How it works
              </button>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <button className={LINK} onClick={comingSoon} type="button">
              Log in
            </button>
            <Button onClick={createAWeave} type="button">
              Create a Weave
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
