import useAvailabilityGridStore, { isEditMode, isViewMode } from "@/store/availabilityGridStore";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

type AvailbilityGridResponseFilterButtonProps = {
  className?: string;
  currentResponses: string[];
  name: string;
  onFilterClicked: (name: string) => void;
};

export default function AvailbilityGridResponseFilterButton({
  className,
  currentResponses,
  name,
  onFilterClicked
}: AvailbilityGridResponseFilterButtonProps) {
  const userFilter = useAvailabilityGridStore(useShallow((state) => state.userFilter));
  const mode = useAvailabilityGridStore((state) => state.mode);
  const user = useAvailabilityGridStore((state) => state.user);

  const isFilterApplied = userFilter.length !== 0;
  const isNotFilteredOutAndSelectedHoveredTime =
    isViewMode(mode) && !currentResponses.includes(name) && userFilter.includes(name);
  const noFilterAndSelectedHoveredTime =
    isViewMode(mode) && !currentResponses.includes(name) && userFilter.length === 0;

  return (
    <motion.button
      className={cn(
        "box-border inline-flex w-min flex-row items-center rounded-md border-2 border-primary-light bg-accent-light px-1 py-[1.5px] text-2xs outline-none duration-100 hover:bg-accent",
        isFilterApplied && {
          "border-2 border-primary font-semibold hover:bg-purple-200": userFilter.includes(name) && isViewMode(mode),
          "border-gray-200 bg-transparent text-gray-300 line-through hover:bg-gray-100 hover:text-gray-500":
            !userFilter.includes(name)
        },
        isEditMode(mode) && {
          "border-transparent bg-transparent text-gray-500 line-through hover:bg-transparent": name !== user,
          "border-transparent font-medium text-secondary no-underline hover:bg-accent-light": name === user
        },
        {
          "border-gray-100 bg-transparent text-gray-400": noFilterAndSelectedHoveredTime,
          "border-gray-500  bg-transparent text-gray-700": isNotFilteredOutAndSelectedHoveredTime
        },
        className
      )}
      onClick={() => onFilterClicked(name)}
      type="button"
      whileTap={isViewMode(mode) ? { scale: 0.92 } : {}}
    >
      <User className="h-4 w-4" />
      <span className="mx-1 max-w-[5.8rem] overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
    </motion.button>
  );
}
