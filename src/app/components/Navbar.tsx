import Link from "next/link";
import { CiSun } from "react-icons/ci";

const Navbar = () => {
  return (
    <div className="container bg-[#E9E3E2] fixed z-20 inset-x-0 top-0 h-10 mx-auto flex w-full justify-between items-center md:px-0 px-10">
      <Link href={"/"}>
        <div>
          <h1 className="">Prateek Singh</h1>
        </div>
      </Link>
      <div className="flex justify-between space-x-5">
        <Link href={"/writings/life/journey-so-far"}>
          <div>Writing</div>
        </Link>
      </div>
      <div className="flex items-center space-x-1">
        <CiSun className="text-xl" />
        <div>Dark</div>
      </div>
    </div>
  );
};

export default Navbar;
