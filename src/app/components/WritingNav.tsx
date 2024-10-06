"use client";
import Link from "next/link";
// import { usePathname } from "next/navigation";

const WritingNav = () => {
  // const pathName = usePathname();
  // const route = pathName.split("/");
  return (
    <div className="flex h-full justify-center gap-x-5 border-r border-[#FAF0E6]">
      <Link href={"/tech"}>Tech</Link>
      <Link href={"/thoughts"}>Thoughts</Link>
      <Link href={"/life"}>Life</Link>
    </div>
  );
};

export default WritingNav;
