"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import useAvailabilityEntry from "@/hooks/useAvailabilityEntry";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
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
  const eventTimeZone = useAvailabilityGridStore((state) => state.eventData.timeZone);
  const selectedTimeZone = useAvailabilityGridStore((state) => state.selectedTimeZone);
  const setSelectedTimeZone = useAvailabilityGridStore((state) => state.setSelectedTimeZone);
  const cancelEditing = useAvailabilityGridStore((state) => state.cancelEditing);
  const setSelectedTimeSlots = useAvailabilityGridStore((state) => state.setSelectedTimeSlots);
  const { namePromptOpen, openAvailability, setNamePromptOpen } = useAvailabilityEntry();
  const hasSavedAvailability = useAvailabilityGridStore((state) =>
    state.eventData.eventResponses.some(({ alias }) => state.user !== "" && alias === state.user)
  );
  // Before someone adds their availability they get a single "Add availability" button;
  // afterwards the control becomes a toggle between viewing and editing.
  const hasStarted = editing || hasSavedAvailability;

  return (
    <>
      {/* Floats over the page on mobile; on desktop it sits in the page flow, 50px below the event container */}
      <div className="fixed bottom-4 left-1/2 z-40 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 pb-[env(safe-area-inset-bottom)] sm:bottom-6 lg:static lg:mx-auto lg:mt-[50px] lg:shrink-0 lg:translate-x-0">
        <div
          aria-label="Availability controls"
          className="card flex h-auto min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 sm:gap-4 sm:px-4"
          role="toolbar"
        >
          {hasStarted ? (
            <div
              aria-label="Availability mode"
              className="flex h-10 shrink-0 items-center rounded-lg bg-input p-1"
              role="group"
            >
              <Button
                aria-pressed={!editing}
                className={cn(
                  "h-8 gap-1.5 rounded-md bg-transparent px-2.5 text-sm text-black hover:bg-light-gray",
                  !editing && "bg-red hover:bg-red"
                )}
                disabled={isSaving}
                onClick={() => editing && cancelEditing()}
                type="button"
                variant="ghost"
              >
                <Image alt="" height={15} src="/icons/weave/eye.svg" width={15} />
                <span className="hidden xs:inline">Viewing</span>
              </Button>
              <Button
                aria-pressed={editing}
                className={cn(
                  "h-8 gap-1 rounded-md bg-transparent px-2.5 text-sm text-black hover:bg-light-gray",
                  editing && "bg-yellow hover:bg-yellow"
                )}
                disabled={isSaving}
                onClick={() => !editing && openAvailability()}
                type="button"
                variant="ghost"
              >
                <Image alt="" height={20} src="/icons/weave/pencil.svg" width={20} />
                <span className="hidden xs:inline">Editing</span>
              </Button>
            </div>
          ) : (
            <Button
              className="h-10 shrink-0 rounded-lg px-4 text-sm"
              disabled={isSaving}
              onClick={openAvailability}
              type="button"
            >
              Add availability
            </Button>
          )}

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
            <BestTimesAvailableSwitch labelStyles="text-2xs sm:text-xs" />
          )}

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
      <EditAvailabilityDialog
        allowModeSelection={false}
        initialViewMode="add-new"
        onOpenChange={setNamePromptOpen}
        open={namePromptOpen}
        title="Add your availability"
        trigger={null}
      />
    </>
  );
}
