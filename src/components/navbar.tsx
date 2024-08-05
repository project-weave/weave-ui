"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScreenSize } from "@/hooks/useScreenSize";
import useAvailabilityGridStore, { isViewMode } from "@/store/availabilityGridStore";
import { Settings } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import BestTimesAvailableSwitch from "./availability-grid/best-times-available-switch";
import { MediaQueryXXS } from "./media-query";

const LOGIN = "Log In";
const SIGN_UP = "Sign Up";

export default function NavBar() {
  const eventId = useAvailabilityGridStore((state) => state.eventData.eventId);
  const mode = useAvailabilityGridStore((state) => state.mode);

  const router = useRouter();
  const pathName = usePathname();
  const isEventPage = eventId !== "" && pathName.startsWith(`/${eventId}`);

  return (
    // adding padding and translating down to hide overflowed components on mobile
    <nav className="fixed top-0 z-50 flex w-full -translate-y-[18.25rem] items-center justify-between bg-white pb-[0.75rem] pt-[19.25rem]">
      <Image
        alt="weave-logo"
        className="ml-4 h-8 w-8 cursor-pointer sm:ml-6 md:ml-9 md:h-9 md:w-9"
        height={40}
        onClick={() => router.push("/")}
        src="/favicon.ico"
        width={40}
      />

      <ul className="items-enter mr-5 flex">
        <li>
          <MediaQueryXXS maxScreenSize={ScreenSize.LG}>
            {isEventPage && isViewMode(mode) && <SettingsPopover />}
          </MediaQueryXXS>
        </li>
        {/* <li>
          <Button className="h-8 rounded-2xl border-none bg-transparent  text-black hover:bg-accent-light">
            {SIGN_UP}
          </Button>
        </li>
        <li>
          <Button className="ml-6 h-8 rounded-2xl border-2 border-primary-light bg-transparent  text-black hover:bg-accent-light">
            {LOGIN}
          </Button>
        </li> */}
      </ul>
    </nav>
  );
}

function SettingsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="t-1 appearance-none border-none p-1 outline-none hover:bg-transparent">
          <Settings className="h-6 w-6 translate-y-1 cursor-pointer text-secondary md:h-7 md:w-7" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="mr-2 mt-2 w-[12rem] bg-background px-4">
        <header className="text-sm font-medium text-secondary">View Settings</header>
        <section className="mt-4 p-0">
          <ul>
            <li className="w-full rounded-xl border-[1px] border-accent bg-accent/20 p-2">
              <BestTimesAvailableSwitch labelStyles="font-normal mr-4" />
            </li>
          </ul>
        </section>
      </PopoverContent>
    </Popover>
  );
}
