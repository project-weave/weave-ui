import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import ParticipantAvatar from "@/components/participant-avatar";
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
        "box-border inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-dark-gray bg-input px-2 py-1 text-2xs font-normal text-black outline-none transition-colors hover:bg-light-gray focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isEditMode(mode) && {
          "border-transparent bg-transparent line-through opacity-40 hover:bg-transparent": name !== loggedInUser,
          "font-medium no-underline hover:bg-input": name === loggedInUser
        },
        isViewMode(mode) &&
          userFilter.length !== 0 && {
            "border-black font-semibold hover:opacity-70": userFilter.includes(name) && isUserHighlighted,
            "border-black/70 font-normal opacity-60": userFilter.includes(name) && !isUserHighlighted,
            "border-light-gray bg-transparent line-through opacity-[0.15] hover:opacity-50 ": !userFilter.includes(name)
          },

        isViewMode(mode) &&
          userFilter.length === 0 &&
          !isUserHighlighted &&
          "border-light-gray bg-transparent opacity-60",
        className
      )}
      disabled={isEditMode(mode)}
      onClick={() => onFilterClicked(name)}
      title={name}
      type="button"
    >
      <ParticipantAvatar className="h-5 w-5 text-[0.6rem]" name={name} />
      <span className="max-w-[10rem] truncate">{name}</span>
    </button>
  );
};

export default memo(AvailbilityGridResponseFilterButton);
