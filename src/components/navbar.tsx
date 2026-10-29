"use client";

import { ChevronDown, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import EditAvailabilityDialog from "@/components/availability-grid/dialog/edit-availability-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";

export default function NavBar() {
  const eventId = useAvailabilityGridStore((state) => state.eventData.eventId);
  const user = useAvailabilityGridStore((state) => state.user);
  const mode = useAvailabilityGridStore((state) => state.mode);
  const isSaving = useAvailabilityGridStore((state) => state.isSavingAvailability);
  const setUserFilter = useAvailabilityGridStore((state) => state.setUserFilter);
  const editing = isEditMode(mode);
  const pathName = usePathname();
  const isEventPage = eventId !== "" && pathName === `/${eventId}`;
  const [participantOpen, setParticipantOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className={`${isEventPage ? "fixed" : "absolute"} left-0 right-0 top-6 z-50`}>
        <div className="mx-auto w-full max-w-[85rem] px-4 sm:px-7">
          <div className="card flex h-auto w-fit max-w-full items-center gap-4 px-5 py-2.5">
            <Link
              aria-label="Weave home"
              className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/"
            >
              <Image alt="Weave" className="h-5 w-5 opacity-70" height={20} priority src="/favicon.ico" width={20} />
            </Link>
            {isEventPage && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Participant profile: ${user || "Guest"}`}
                    className="h-auto min-w-0 gap-2 rounded-sm bg-light-purple p-1.5 text-black"
                    disabled={isSaving}
                    type="button"
                    variant="ghost"
                  >
                    <UserCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span className="max-w-[8rem] truncate text-sm font-medium" title={user || "Guest"}>
                      {user || "Guest"}
                    </span>
                    <ChevronDown aria-hidden="true" className="h-3 w-3 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-w-[calc(100vw-1.5rem)]">
                  <DropdownMenuLabel className="break-words font-medium">
                    {user || "Guest participant"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user && (
                    <DropdownMenuItem disabled={editing} onSelect={() => setUserFilter([user])}>
                      View my availability
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled={editing} onSelect={() => setParticipantOpen(true)}>
                    Change participant
                  </DropdownMenuItem>
                  {editing && (
                    <DropdownMenuItem onSelect={() => useAvailabilityGridStore.getState().cancelEditing()}>
                      Discard changes and view
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild disabled={editing}>
                    <Link href="/">Create a Weave</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>
      <EditAvailabilityDialog onOpenChange={setParticipantOpen} open={participantOpen} trigger={null} />
    </>
  );
}
