"use client";

import { Menu, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/utils/cn";

const LINK =
  "rounded-md text-[13px] text-text-light transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const MENU_ITEM =
  "w-full rounded-sm px-3 py-2.5 text-left text-sm text-black transition-colors hover:bg-light-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Top bar on every page: the Weave logo and wordmark, two info links and Log in (not built yet: they say
 * "Coming soon"). Away from the home page it also has a "New Weave" button on the right; on the home page
 * that button lives in the hero instead. On phones everything but the logo sits in a menu.
 */
export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  // close the phone menu when the page changes
  useEffect(() => setMenuOpen(false), [pathname]);

  function comingSoon() {
    setMenuOpen(false);
    toast({ description: "Coming soon", duration: 2000 });
  }

  // goes home to the new event form
  function newWeave() {
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <nav aria-label="Main navigation" className="absolute inset-x-0 top-0 z-50 h-[3.25rem] md:h-[3.75rem]">
      {/* same side padding and 82rem width as the page content, so the wordmark lines up with the cards */}
      <div className="h-full w-full px-6 sm:px-8 lg:px-5">
        <div className="mx-auto flex h-full w-full max-w-[82rem] items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              aria-label="Weave home"
              className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/"
            >
              <Image alt="" className="h-6 w-auto" height={24} priority src="/logo-mark.svg" width={29} />
              <span className="ml-2 text-lg font-medium leading-none tracking-tight text-black">Weave</span>
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
            {!isHome && <NewWeaveButton onClick={newWeave} />}
          </div>

          {/* phones: one menu button, opening a left-aligned list */}
          <Popover onOpenChange={setMenuOpen} open={menuOpen}>
            <PopoverTrigger asChild>
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="-mr-2 flex h-9 w-9 items-center justify-center rounded-md text-black transition-colors hover:bg-light-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
                type="button"
              >
                {menuOpen ? (
                  <X aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Menu aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="flex w-[calc(100vw-3rem)] flex-col items-stretch gap-0.5 rounded-xl bg-white p-1.5 sm:hidden"
              sideOffset={6}
            >
              <button className={MENU_ITEM} onClick={comingSoon} type="button">
                Our story
              </button>
              <button className={MENU_ITEM} onClick={comingSoon} type="button">
                How it works
              </button>
              <button className={MENU_ITEM} onClick={comingSoon} type="button">
                Log in
              </button>
              {!isHome && (
                <>
                  <div className="mx-3 my-1 h-px bg-light-gray" />
                  <NewWeaveButton className="justify-start" onClick={newWeave} />
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}

/** "+ New Weave": the call to action in the home page hero and, on other pages, the top right of the nav. */
export function NewWeaveButton({ className, onClick }: { className?: string; onClick: () => void }) {
  return (
    <Button className={cn("gap-1.5", className)} onClick={onClick} type="button">
      <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
      New Weave
    </Button>
  );
}
