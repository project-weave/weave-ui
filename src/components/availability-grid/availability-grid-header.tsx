import { format } from "date-fns";

type AvailabilityGridHeaderProps = {
  areAllDatesInSameMonth: boolean;
  areAllDatesInSameYear: boolean;
  boxClassName?: string;
  earliestDate: Date;
  latestDate: Date;
};

export default function AvailabilityGridHeader({
  areAllDatesInSameMonth,
  areAllDatesInSameYear,
  boxClassName,
  earliestDate,
  latestDate
}: AvailabilityGridHeaderProps) {
  let heading = "";

  if (!areAllDatesInSameYear) {
    heading = `${format(earliestDate, "MMM yyyy")} - ${format(latestDate, "MMM yyyy")} `;
  } else if (areAllDatesInSameMonth) {
    heading = format(earliestDate, "MMM yyyy");
  } else {
    heading = `${format(earliestDate, "MMM")} - ${format(latestDate, "MMM yyyy")}`;
  }

  return (
    <div className={boxClassName}>
      <div className="flex">
        <h1 className="mb-[2px] mr-32 whitespace-nowrap text-xl font-semibold tracking-wide text-secondary">
          {heading}
        </h1>
      </div>
      <p className="text-2xs mb-2 tracking-wider text-primary">GMT-07</p>
      <hr className="h-[2px] bg-secondary" />
    </div>
  );
}
