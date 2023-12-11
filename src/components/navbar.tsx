import Image from "next/image";

import { Button } from "./ui/button";

const LOGIN = "Log in";
const SIGN_UP = "Sign up";

export default function NavBar() {
  return (
    <nav className="relative z-50 m-auto flex justify-between bg-white pb-4 pt-8">
      <Image
        alt="weave-logo"
        className="h-8 w-8 opacity-70 2xl:h-9 2xl:w-9"
        height={40}
        src="/favicon.ico"
        width={40}
      />
      <ul className="items-enter flex">
        <li>
          <Button className="h-8 rounded-xl border-none bg-transparent text-sm text-black hover:bg-accent-light">
            {SIGN_UP}
          </Button>
        </li>
        <li>
          <Button className="ml-6 h-8 rounded-xl border-2 border-primary-light bg-transparent text-sm text-black hover:bg-accent-light">
            {LOGIN}
          </Button>
        </li>
      </ul>
    </nav>
  );
}
