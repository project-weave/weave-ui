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
      <ul className="flex pd">
        <button className="font-bold transition-transform transform duration-200 ease-in-out hover:scale-110"> Sign up </button>
        <button className="font-bold px-5 bg-white border-2 border-primary rounded-2xl ml-12 transition-transform transform duration-200 ease-in-out hover:scale-110"> Log in </button>        
      </ul>
    </nav>
  );
}
