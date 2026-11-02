import { cn } from "@/utils/cn";

export default function ParticipantAvatar({ className, name }: { className?: string; name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-2xs font-medium text-black",
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
