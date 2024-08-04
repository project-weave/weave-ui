"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
const LOGIN = "Log In";
const SIGN_UP = "Sign Up";

export default function NavBar() {
  const router = useRouter();

  return (
    // adding padding and translating down to hide overflowed components on mobile
    <nav className="fixed top-0 z-50 flex w-full -translate-y-[18.25rem] bg-white pb-[0.75rem] pt-[19.25rem]">
      <Image
        alt="weave-logo"
        className="ml-4 h-8 w-8 cursor-pointer xs:ml-9 md:h-9 md:w-9 "
        height={40}
        onClick={() => router.push("/")}
        src="/favicon.ico"
        width={40}
      />
      {/* <ul className="items-enter flex">
        <li>
          <Button className="h-8 rounded-2xl border-none bg-transparent  text-black hover:bg-accent-light">
            {SIGN_UP}
          </Button>
        </li>
        <li>
          <Button className="ml-6 h-8 rounded-2xl border-2 border-primary-light bg-transparent  text-black hover:bg-accent-light">
            {LOGIN}
          </Button>
        </li>
      </ul> */}
    </nav>
  );
}
