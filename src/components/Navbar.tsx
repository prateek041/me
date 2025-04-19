import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

const Navbar = () => {
  return (
    <div className="container bg-background/40 backdrop-blur-lg fixed z-20 inset-x-0 top-0 h-14 mx-auto w-full">
      <div className=" h-full rounded-bl-md rounded-br-sm px-5 flex justify-between items-center">
        <div className="flex gap-x-5">
          <Link href={"/"}>
            <div>
              <h1 className="text-lg font-semibold">Prateek Singh</h1>
            </div>
          </Link>
          <div className="flex justify-between space-x-5 items-center">
            <Link href={"/writings/life/journey-so-far"}>
              <p className="text-base font-medium">
                Writings
              </p>
            </Link>
          </div>
        </div>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
