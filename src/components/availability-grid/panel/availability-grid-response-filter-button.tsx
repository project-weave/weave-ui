import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";

type AvailbilityGridResponseFilterButtonProps = {
  className?: string;
  name: string;
};

const AvailbilityGridResponseFilterButton = ({ className, name }: AvailbilityGridResponseFilterButtonProps) => {
  const [userFilter, setUserFilter] = useAvailabilityGridStore(
    useShallow((state) => [state.userFilter, state.setUserFilter])
  );
  const mode = useAvailabilityGridStore((state) => state.mode);
  const loggedInUser = useAvailabilityGridStore((state) => state.user);
  const isUserHighlighted = useAvailabilityGridStore((state) => {
    const { eventData, hoveredTimeSlot, userFilter } = state;

    if (!hoveredTimeSlot) return true;
    if (userFilter.length > 0 && !userFilter.includes(name)) return false;

    const hoveredTimeSlotResponses = eventData.timeSlotsToParticipants[hoveredTimeSlot] ?? [];

    return userFilter.length === 0
      ? hoveredTimeSlotResponses.includes(name)
      : hoveredTimeSlotResponses.includes(name) && userFilter.includes(name);
  });

  function onFilterClicked(user: string) {
    if (isEditMode(mode)) return;

    const newUserFilter = [...userFilter];
    if (newUserFilter.includes(user)) {
      newUserFilter.splice(userFilter.indexOf(user), 1);
    } else {
      newUserFilter.push(user);
    }
    setUserFilter(newUserFilter);
  }

  return (
    <button
      aria-pressed={userFilter.includes(name)}
      className={cn(
        // same grey as the mini calendar; selected names turn purple
        "box-border inline-flex min-w-0 max-w-full items-center rounded-md bg-input px-2.5 py-1 text-2xs font-normal text-black outline-none transition-[background-color,color,opacity] duration-150 hover:bg-light-gray focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isViewMode(mode) && userFilter.includes(name) && "bg-primary text-white hover:bg-primary-hover",
        // while hovering a time slot, names that aren't available then fade back
        isViewMode(mode) && !isUserHighlighted && "opacity-50",
        isEditMode(mode) && {
          "bg-transparent opacity-40 hover:bg-transparent": name !== loggedInUser,
          "bg-primary text-white hover:bg-primary": name === loggedInUser
        },
        className
      )}
      disabled={isEditMode(mode)}
      onClick={() => onFilterClicked(name)}
      title={name}
      type="button"
    >
      <span className="max-w-[10rem] truncate">{name}</span>
    </button>
  );
};

export default memo(AvailbilityGridResponseFilterButton);
