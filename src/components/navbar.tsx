"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
const LOGIN = "Log In";
const SIGN_UP = "Sign Up";

export default function NavBar() {
  const router = useRouter();

  return (
    <nav className="fixed z-50 flex w-full bg-white pb-4 pt-7">
      <Image
        alt="weave-logo"
        className="ml-4 h-8 w-8 cursor-pointer xs:ml-9 md:h-9 md:w-9 lg:h-10 lg:w-10"
        height={40}
        onClick={() => router.push("/")}
        src="/favicon.ico"
        width={40}
      />
      {/* <ul className="items-enter flex">
        <li>
          <Button className="h-8 rounded-2xl border-none bg-transparent text-sm text-black hover:bg-accent-light">
            {SIGN_UP}
          </Button>
        </li>
        <li>
          <Button className="ml-6 h-8 rounded-2xl border-2 border-primary-light bg-transparent text-sm text-black hover:bg-accent-light">
            {LOGIN}
          </Button>
        </li>
      </ul> */}
    </nav>
  );
}
