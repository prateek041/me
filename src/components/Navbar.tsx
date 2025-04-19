import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

const Navbar = () => {
  return (
    <div className="container fixed z-20 inset-x-0 top-0 h-10 mx-auto flex w-full justify-between items-center md:px-0 px-10">
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
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
