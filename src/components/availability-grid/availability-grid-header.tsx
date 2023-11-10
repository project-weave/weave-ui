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
    heading = `${format(earliestDate, "yyyy")} - ${format(latestDate, "yyyy")} `;
  } else if (areAllDatesInSameMonth) {
    heading = format(earliestDate, "MMMM yyyy");
  } else {
    heading = format(earliestDate, "yyyy");
  }

  return (
    <div className={boxClassName}>
      <div className="flex">
        <h1 className="mb-2 mr-32 whitespace-nowrap text-3xl font-semibold tracking-wide text-secondary">{heading}</h1>
      </div>
      <p className="mb-2 text-sm tracking-wider text-primary">GMT-07</p>
      <hr className="h-[2px] bg-secondary" />
    </div>
  );
}
