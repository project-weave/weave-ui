import { User } from "lucide-react";
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
    const { hoveredTimeSlot, userFilter, eventData } = state;

    if (!hoveredTimeSlot) return true;
    if (userFilter.length > 0 && !userFilter.includes(name)) return false;

    const hoveredTimeSlotResponses = eventData.timeSlotsToParticipants[hoveredTimeSlot] ?? [];

    return userFilter.length === 0
      ? hoveredTimeSlotResponses.includes(name)
      : hoveredTimeSlotResponses.some((user) => userFilter.includes(user));
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
      className={cn(
        "box-border inline-flex w-min flex-row items-center rounded-md border-2 border-primary-light bg-accent-light px-1 py-[1.5px] text-2xs text-secondary outline-none duration-100 hover:bg-accent",
        isEditMode(mode) && {
          "border-transparent bg-transparent text-gray-500 line-through hover:bg-transparent": name !== loggedInUser,
          "border-transparent font-medium text-secondary no-underline hover:bg-accent-light": name === loggedInUser
        },
        isViewMode(mode) &&
          userFilter.length !== 0 && {
            "border-2 border-primary font-semibold hover:bg-purple-200": userFilter.includes(name),
            "border-gray-200 bg-transparent text-gray-300 line-through hover:bg-gray-100 hover:text-gray-500":
              !userFilter.includes(name)
          },
        isViewMode(mode) &&
          !isUserHighlighted && {
            "border-gray-300 bg-transparent text-gray-400": userFilter.length === 0,
            "border-gray-400 bg-transparent text-gray-500": userFilter.includes(name)
          },
        className
      )}
      onClick={() => onFilterClicked(name)}
      type="button"
    >
      <User className="h-4 w-4" />
      <span className="mx-1 max-w-[5.8rem] overflow-hidden text-ellipsis whitespace-nowrap lg:max-w-[4.5rem] xl:max-w-[5.2rem]">
        {name}
      </span>
    </button>
  );
};

export default memo(AvailbilityGridResponseFilterButton);
