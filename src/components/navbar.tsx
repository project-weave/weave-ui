import { UserCircle } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  return (
    <nav className="mb-9 flex w-full justify-between">
      <Image alt="weave-logo" className="h-[38px] w-[35px] opacity-70" height={40} src="/favicon.ico" width={40} />
      <ul>
        <li>
          <UserCircle className="h-[38px] w-[35px] text-gray-600 opacity-90" />
        </li>
      </ul>
    </nav>
  );
}
