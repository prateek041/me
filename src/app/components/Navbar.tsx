import Link from "next/link";
import { CiSun } from "react-icons/ci";

const Navbar = () => {
  return (
    <div className="container mx-auto flex w-full justify-between my-2">
      <Link href={"/"}>
        <div>
          <h1 className="md:text-4xl text-base">Prateek Singh</h1>
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
