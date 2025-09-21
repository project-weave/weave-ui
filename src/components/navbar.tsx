"use client";

import { ChevronDown, UserCircle } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import useAvailabilityGridStore from "@/store/availabilityGridStore";

export default function NavBar() {
  const eventId = useAvailabilityGridStore((state) => state.eventData.eventId);
  const user = useAvailabilityGridStore((state) => state.user);

  const router = useRouter();
  const pathName = usePathname();
  const isEventPage = eventId !== "" && pathName.startsWith(`/${eventId}`);

  return (
    <nav className="fixed top-6 z-50 w-full">
      <div className="w-full max-w-[85rem] pl-7">
        <div className="card flex w-fit items-center gap-4 px-5 py-2.5 ">
          <div className="flex items-center gap-6">
            <Image
              alt="weave-logo"
              className="h-5 w-5 cursor-pointer opacity-70"
              height={20}
              onClick={() => router.push("/")}
              src="/favicon.ico"
              width={20}
            />

            {isEventPage && (
              <>
                <div className="bg-light-purple flex items-center gap-2 rounded-sm p-1.5">
                  <UserCircle className="h-5 w-5" />
                  <span className="text-sm font-medium text-black">{user || "Brian Yang"}</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
