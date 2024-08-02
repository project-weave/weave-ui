import { AvailabilityGridMode, isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { User } from "lucide-react";

type AvailbilityGridBResponseFilterButtonProps = {
  filteredUsersSelectedHoveredTimeSlot: string[];
  filterUserHandler: (name: string) => void;
  mode: AvailabilityGridMode;
  name: string;
  user: string;
  userFilter: string[];
};

export default function AvailbilityGridBResponseFilterButton({
  filteredUsersSelectedHoveredTimeSlot,
  filterUserHandler,
  mode,
  name,
  user,
  userFilter
}: AvailbilityGridBResponseFilterButtonProps) {
  const isFilterApplied = userFilter.length !== 0;
  const isNotFilteredOutAndSelectedHoveredTime =
    isViewMode(mode) && !filteredUsersSelectedHoveredTimeSlot.includes(name) && userFilter.includes(name);
  const noFilterAndSelectedHoveredTime =
    isViewMode(mode) && !filteredUsersSelectedHoveredTimeSlot.includes(name) && userFilter.length === 0;

  return (
    <motion.button
      className={cn(
        "inline-flex w-min flex-row items-center rounded-md border-2 border-primary-light bg-accent-light px-1 py-[1.5px] outline-none duration-100 hover:bg-accent",
        isFilterApplied && {
          "border-2 border-primary font-semibold hover:bg-purple-200": userFilter.includes(name) && isViewMode(mode),
          "border-gray-200 bg-transparent text-gray-300 line-through hover:bg-gray-50 hover:text-gray-400":
            !userFilter.includes(name)
        },
        isEditMode(mode) && {
          "border-transparent bg-transparent text-gray-400 line-through hover:bg-transparent": name !== user,
          "border-transparent font-medium text-secondary no-underline hover:bg-accent-light": name === user
        },
        {
          "border-gray-100 bg-transparent text-gray-300": noFilterAndSelectedHoveredTime,
          "border-gray-300 bg-gray-300 bg-transparent text-gray-400": isNotFilteredOutAndSelectedHoveredTime
        }
      )}
      onClick={() => filterUserHandler(name)}
      type="button"
      whileTap={isViewMode(mode) ? { scale: 0.92 } : {}}
    >
      <User className="h-4 w-4" />
      <span className="mx-1 max-w-[5.8rem] overflow-hidden text-ellipsis whitespace-nowrap text-2xs">{name}</span>
    </motion.button>
  );
}
