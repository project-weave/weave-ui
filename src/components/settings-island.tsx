"use client";

import { ChevronsUpDown, Eye, Link2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isEditMode } from "@/store/availabilityGridStore";

import BestTimesAvailableSwitch from "./availability-grid/best-times-available-switch";
import EditAvailabilityDialog from "./availability-grid/dialog/edit-availability-dialog";

interface SettingsIslandProps {
  onCopyClick?: () => void;
}

export function SettingsIsland({ onCopyClick }: SettingsIslandProps) {
  const mode = useAvailabilityGridStore((state) => state.mode);
  const currentIsEditMode = isEditMode(mode);

  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-4 rounded-xl bg-white px-4 py-3 shadow-[0px_0px_50px_10px_rgba(0,0,0,0.05)] ">
        {currentIsEditMode ? (
          <Button
            className="flex items-center rounded-md bg-yellow px-4 py-2 text-sm font-medium text-black hover:bg-yellow/80"
            form="availability-grid"
            type="submit"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editing Availability
            <ChevronsUpDown className="ml-2 h-3 w-3" />
          </Button>
        ) : (
          <EditAvailabilityDialog
            trigger={
              <div className="flex items-center rounded-md bg-red px-4 py-2 text-sm hover:opacity-80">
                <Eye className="mr-2 h-4 w-4" />
                Viewing Availability
                <ChevronsUpDown className="ml-2 h-3 w-3" />
              </div>
            }
          />
        )}

        {!currentIsEditMode && (
          <>
            <div className="h-6 w-px bg-light-gray"></div>
            <BestTimesAvailableSwitch labelStyles="text-xs font-medium" />
          </>
        )}

        <div className="h-6 w-px bg-light-gray"></div>

        <Button className="h-8 w-8 rounded-md p-0 hover:bg-secondary" onClick={onCopyClick} size="sm" variant="ghost">
          <Link2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
