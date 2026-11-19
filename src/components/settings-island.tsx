"use client";

import { Link2, Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import useAvailabilityEntry from "@/hooks/useAvailabilityEntry";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

import BestTimesAvailableSwitch from "./availability-grid/best-times-available-switch";
import EditAvailabilityDialog from "./availability-grid/dialog/edit-availability-dialog";

// true when the slots picked in edit mode differ from what the user last saved
function hasUnsavedChanges() {
  const { eventData, selectedTimeSlots, user } = useAvailabilityGridStore.getState();
  const saved = eventData.eventResponses.find(({ alias }) => alias === user)?.availabilities ?? [];
  if (saved.length !== selectedTimeSlots.length) return true;
  const savedSet = new Set(saved);
  return selectedTimeSlots.some((timeSlot) => !savedSet.has(timeSlot));
}

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

  const [unsavedPromptOpen, setUnsavedPromptOpen] = useState(false);

  function onViewClick() {
    if (!editing) return;
    if (hasUnsavedChanges()) setUnsavedPromptOpen(true);
    else cancelEditing();
  }

  function saveAndView() {
    setUnsavedPromptOpen(false);
    // saving switches back to view mode once the request succeeds
    (document.getElementById("availability-grid") as HTMLFormElement | null)?.requestSubmit();
  }

  function discardAndView() {
    setUnsavedPromptOpen(false);
    cancelEditing();
  }

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<null | number>(null);
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => setContentWidth(content.offsetWidth));
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Floats over the page on mobile; on desktop it sits in the page flow, 50px below the event container */}
      <div className="fixed bottom-4 left-1/2 z-40 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 pb-[env(safe-area-inset-bottom)] sm:bottom-6 lg:static lg:mx-auto lg:mt-[50px] lg:shrink-0 lg:translate-x-0">
        {/* The card's width follows its contents with an ease-out transition so switching modes isn't jumpy */}
        <div
          aria-label="Availability controls"
          className="card h-auto w-auto overflow-hidden rounded-2xl p-0 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          role="toolbar"
          style={{ width: contentWidth === null ? undefined : contentWidth + 2 }}
        >
          <div className="flex w-max min-w-0 items-center gap-1.5 p-1.5 sm:gap-2" ref={contentRef}>
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
                  onClick={onViewClick}
                  type="button"
                  variant="ghost"
                >
                  <Image alt="" height={15} src="/icons/weave/eye.svg" width={15} />
                  <span className="hidden xs:inline">View</span>
                </Button>
                <Button
                  aria-pressed={editing}
                  className={cn(
                    "h-8 gap-1.5 rounded-md bg-transparent px-2.5 text-sm text-black hover:bg-light-gray",
                    editing && "bg-yellow hover:bg-yellow"
                  )}
                  disabled={isSaving}
                  onClick={() => !editing && openAvailability()}
                  type="button"
                  variant="ghost"
                >
                  <Pencil absoluteStrokeWidth aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span className="hidden xs:inline">Edit</span>
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
                Save
              </Button>
            ) : (
              <BestTimesAvailableSwitch />
            )}

            <Button
              aria-label="Copy event link"
              className="h-10 w-10 shrink-0 rounded-lg p-0"
              onClick={onCopyClick}
              title="Copy event link"
              type="button"
              variant="ghost"
            >
              <Link2 absoluteStrokeWidth aria-hidden="true" className="h-[15px] w-[15px]" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
      <Dialog onOpenChange={setUnsavedPromptOpen} open={unsavedPromptOpen}>
        <DialogContent className="max-w-[min(24rem,calc(100vw-1.5rem))]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Save your availability?</DialogTitle>
            <DialogDescription>You have changes that haven&apos;t been saved yet.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button onClick={discardAndView} type="button" variant="ghost">
              Discard
            </Button>
            <Button autoFocus onClick={saveAndView} type="button">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
