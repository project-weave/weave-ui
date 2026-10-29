"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import useAvailabilityGridStore, { AvailabilityGridMode, isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { isSupportedTimeZone } from "@/utils/timeZone";

import BestTimesAvailableSwitch from "./availability-grid/best-times-available-switch";
import EditAvailabilityDialog from "./availability-grid/dialog/edit-availability-dialog";
import AvailabilityParticipantFilters from "./availability-grid/panel/availability-participant-filters";
import TimeZoneDropdown from "./timezone-dropdown";

interface SettingsIslandProps {
  onCopyClick?: () => void;
}

export function SettingsIsland({ onCopyClick }: SettingsIslandProps) {
  const mode = useAvailabilityGridStore((state) => state.mode);
  const editing = isEditMode(mode);
  const isSaving = useAvailabilityGridStore((state) => state.isSavingAvailability);
  const participants = useAvailabilityGridStore((state) => state.eventData.allParticipants);
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const selectedTimeZone = useAvailabilityGridStore((state) => state.selectedTimeZone);
  const setSelectedTimeZone = useAvailabilityGridStore((state) => state.setSelectedTimeZone);
  const cancelEditing = useAvailabilityGridStore((state) => state.cancelEditing);
  const setSelectedTimeSlots = useAvailabilityGridStore((state) => state.setSelectedTimeSlots);
  const user = useAvailabilityGridStore((state) => state.user);
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<"add-new" | "edit-existing">("add-new");

  function openEntry(next: "add-new" | "edit-existing") {
    setEntryMode(next);
    setEntryOpen(true);
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-40 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 pb-[env(safe-area-inset-bottom)] sm:bottom-6">
        <div
          aria-label="Availability controls"
          className="card flex h-auto min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 sm:gap-4 sm:px-4"
          role="toolbar"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Availability mode: ${editing ? "Editing" : "Viewing"}`}
                className={cn(
                  "h-10 shrink-0 gap-2 rounded-lg px-2.5 text-sm text-black",
                  editing ? "bg-yellow hover:bg-yellow/80" : "bg-red hover:bg-red/80"
                )}
                disabled={isSaving}
                type="button"
                variant="ghost"
              >
                <Image
                  alt=""
                  height={editing ? 24 : 15}
                  src={editing ? "/icons/weave/pencil.svg" : "/icons/weave/eye.svg"}
                  width={editing ? 24 : 15}
                />
                <span className="hidden xs:inline">{editing ? "Editing" : "Viewing"}</span>
                <Image alt="" height={10} src="/icons/weave/mode.svg" width={10} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-w-[calc(100vw-1.5rem)]" side="top">
              {editing ? (
                <>
                  <DropdownMenuItem>Continue editing</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={cancelEditing}>Discard changes and view</DropdownMenuItem>
                </>
              ) : (
                <>
                  {user && (
                    <DropdownMenuItem
                      onSelect={() => {
                        const state = useAvailabilityGridStore.getState();
                        state.setUserGridState(user);
                        state.setMode(AvailabilityGridMode.EDIT);
                      }}
                    >
                      Edit my availability
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => openEntry("add-new")}>Add availability</DropdownMenuItem>
                  {participants.length > 0 && (
                    <DropdownMenuItem onSelect={() => openEntry("edit-existing")}>Edit availability</DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {editing ? (
            <Button
              className="h-10 shrink-0 rounded-lg bg-success px-3 text-sm text-black hover:bg-success/80"
              disabled={isSaving}
              form="availability-grid"
              type="submit"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          ) : (
            <BestTimesAvailableSwitch labelStyles="hidden text-xs sm:block" />
          )}

          <span aria-hidden="true" className="h-6 w-px shrink-0 bg-light-gray" />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                aria-label="Event settings"
                className="h-10 w-10 shrink-0 rounded-lg p-0"
                disabled={isSaving}
                title="Event settings"
                type="button"
                variant="ghost"
              >
                <Image alt="" height={24} src="/icons/weave/settings.svg" width={24} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80dvh] max-w-[min(32rem,calc(100vw-1.5rem))] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Event settings</DialogTitle>
                <DialogDescription>Choose how you view this event.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <p className="text-xs text-text-light">Display time zone</p>
                  <TimeZoneDropdown
                    error={false}
                    gridDropdown
                    onChange={setSelectedTimeZone}
                    originalTimeZone={eventTimeZone}
                    selected={isSupportedTimeZone(selectedTimeZone) ? selectedTimeZone : eventTimeZone}
                  />
                </div>
                {!editing && <BestTimesAvailableSwitch />}
                <div className="space-y-3">
                  <h2 className="text-sm font-medium">Participants</h2>
                  <AvailabilityParticipantFilters />
                </div>
                {editing && (
                  <Button onClick={() => setSelectedTimeSlots([])} type="button" variant="ghost">
                    Clear selected times
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            aria-label="Copy event link"
            className="h-10 w-10 shrink-0 rounded-lg p-0"
            onClick={onCopyClick}
            title="Copy event link"
            type="button"
            variant="ghost"
          >
            <Image alt="" height={24} src="/icons/weave/link.svg" width={24} />
          </Button>
        </div>
      </div>
      <EditAvailabilityDialog initialViewMode={entryMode} onOpenChange={setEntryOpen} open={entryOpen} trigger={null} />
    </>
  );
}
