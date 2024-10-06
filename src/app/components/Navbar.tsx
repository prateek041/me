import Link from "next/link";
import { CiSun } from "react-icons/ci";

const Navbar = () => {
  return (
    <div className="container mx-auto flex w-full justify-between my-2">
      <div>Prateek Singh</div>
      <div className="flex justify-between space-x-5">
        <Link href={"#about"}>
          <div>About</div>
        </Link>
        <Link href={"/writings"}>
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
