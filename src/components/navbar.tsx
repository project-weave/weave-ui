"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

export default function NavBar() {
  const eventId = useAvailabilityGridStore((state) => state.eventData.eventId);
  const pathName = usePathname();
  const isEventPage = eventId !== "" && pathName === `/${eventId}`;

  // The create event (home) page has no navbar; event pages only show the logo.
  if (!isEventPage) return null;

  return (
    <nav aria-label="Main navigation" className="fixed left-0 right-0 top-6 z-50">
      <div className="mx-auto w-full max-w-[85rem] px-4 sm:px-7">
        <div className="card flex h-auto w-fit items-center px-3 py-2.5">
          <Link
            aria-label="Weave home"
            className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            <Image alt="Weave" className="h-5 w-5 opacity-70" height={20} priority src="/favicon.ico" width={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
