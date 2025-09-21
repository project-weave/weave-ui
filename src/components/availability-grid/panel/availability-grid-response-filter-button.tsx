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
    const { eventData, hoveredTimeSlot, userFilter } = state;

    if (!hoveredTimeSlot) return true;
    if (userFilter.length > 0 && !userFilter.includes(name)) return false;

    const hoveredTimeSlotResponses = eventData.timeSlotsToParticipants[hoveredTimeSlot] ?? [];

    console.log("userFilter", userFilter);
    console.log(hoveredTimeSlotResponses);
    console.log(
      name,
      userFilter.length === 0
        ? hoveredTimeSlotResponses.includes(name)
        : hoveredTimeSlotResponses.includes(name) && userFilter.includes(name)
    );

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
      className={cn(
        "m-[1px] box-border inline-flex w-min flex-row items-center rounded-md border-[1px] border-dark-gray bg-input px-2 py-[2px] text-2xs font-normal text-black outline-none duration-100 hover:bg-light-gray",
        isEditMode(mode) && {
          "border-transparent bg-transparent line-through opacity-40 hover:bg-transparent": name !== loggedInUser,
          "font-medium no-underline hover:bg-input": name === loggedInUser
        },
        isViewMode(mode) &&
          userFilter.length !== 0 && {
            "border-black font-semibold hover:opacity-70": userFilter.includes(name) && isUserHighlighted,
            "border-black/70 font-normal opacity-20 ": userFilter.includes(name) && !isUserHighlighted,
            "border-light-gray bg-transparent line-through opacity-[0.15] hover:opacity-50 ": !userFilter.includes(name)
          },

        isViewMode(mode) &&
          userFilter.length === 0 &&
          !isUserHighlighted && {
            "border-transparent bg-transparent opacity-20": userFilter.length === 0,
            "opacity-50x border-transparent bg-transparent": userFilter.includes(name)
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
