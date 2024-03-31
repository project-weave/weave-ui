import { startOfToday } from "date-fns";
import { useEffect, useState } from "react";

export default function useToday() {
  const [today, setToday] = useState<Date>(new Date());

  useEffect(() => {
    setToday(startOfToday());
  }, []);

  return today;
}
