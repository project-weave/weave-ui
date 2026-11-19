"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import useAvailabilityEntry from "@/hooks/useAvailabilityEntry";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

import BestTimesAvailableSwitch from "./availability-grid/best-times-available-switch";
import EditAvailabilityDialog from "./availability-grid/dialog/edit-availability-dialog";

interface SettingsIslandProps {
  onCopyClick?: () => void;
}

export function SettingsIsland({ onCopyClick }: SettingsIslandProps) {
  const mode = useAvailabilityGridStore((state) => state.mode);
  const editing = isEditMode(mode);
  const isSaving = useAvailabilityGridStore((state) => state.isSavingAvailability);
  const cancelEditing = useAvailabilityGridStore((state) => state.cancelEditing);
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
