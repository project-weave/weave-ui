import { UserCircle } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  return (
    <nav className="relative z-50 m-auto flex justify-between bg-white py-6">
      <Image
        alt="weave-logo"
        className="h-8 w-8 opacity-70 2xl:h-9 2xl:w-9"
        height={40}
        src="/favicon.ico"
        width={40}
      />
      <ul>
        <li>
          <UserCircle className="h-8 w-8 text-gray-600 opacity-90 2xl:h-9 2xl:w-9" />
        </li>
      </ul>
    </nav>
  );
}
