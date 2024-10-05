import { CiSun } from "react-icons/ci";

const Navbar = () => {
  return (
    <div className="container mx-auto flex w-full justify-between my-2">
      <div>Prateek Singh</div>
      <div className="flex justify-between space-x-5">
        <div>About</div>
        <div>Writing</div>
      </div>
      <div className="flex items-center space-x-1">
        <CiSun className="text-xl" />
        <div>Dark</div>
      </div>
    </div>
  );
};

export default Navbar;
