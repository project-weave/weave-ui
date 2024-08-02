import { Button } from "@/components/ui/button";
import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { motion } from "framer-motion";

import BestTimesAvailableSwitch from "../best-times-available-switch";
import EditAvailabilityDialog from "../dialog/edit-availability-dialog";

const SAVE_AVAILABILITY_BUTTON_TEXT = "Save Availability";

type AvailabilityGridBottomPanelProps = {
  handleSaveUserAvailability: (user: string) => void;
};

export default function AvailabilityGridBottomPanel({ handleSaveUserAvailability }: AvailabilityGridBottomPanelProps) {
  const { allParticipants } = useAvailabilityGridStore((state) => state.eventData);
  const user = useAvailabilityGridStore((state) => state.user);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const MotionButton = motion(Button);

  const saveUserAvailabilityButton = (
    <MotionButton
      className="h-[1.9rem] whitespace-nowrap rounded-[.4rem]"
      onClick={() => handleSaveUserAvailability(user)}
      variant="default"
      whileTap={{ scale: 0.94 }}
    >
      {SAVE_AVAILABILITY_BUTTON_TEXT}
    </MotionButton>
  );

  const editUserAvailabilityButton = (
    <EditAvailabilityDialog
      allParticipants={allParticipants}
      className="h-[2.2rem] whitespace-nowrap rounded-[.4rem]"
    />
  );

  return (
    <div className="m-auto grid max-w-[50rem] grid-flow-col justify-between">
      <BestTimesAvailableSwitch />
      <div className="text-sm">{isViewMode(mode) ? editUserAvailabilityButton : saveUserAvailabilityButton}</div>
    </div>
  );
}
