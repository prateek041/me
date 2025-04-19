"use client";

import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import WritingNav from "./WritingNav";
import { IoIosArrowBack } from "react-icons/io";
import { FileSystemNode } from "@/app/writings/api/blog";

const MobileNav = ({ nodes }: { nodes: FileSystemNode[] }) => {
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="container z-10 fixed mx-auto px-5">
      {isOpen ? (
        <OpenNav toggleOpen={toggleOpen} nodes={nodes} />
      ) : (
        <ClosedNav toggleOpen={toggleOpen} />
      )}
    </div>
  );
};

const ClosedNav = ({ toggleOpen }: { toggleOpen: () => void }) => {
  return (
    <div
      onClick={toggleOpen}
      className="w-fit bg-[#E9E3E2] mt-10 p-2 rounded-r-lg"
    >
      <RxHamburgerMenu />
    </div>
  );
};

const OpenNav = ({
  nodes,
  toggleOpen,
}: {
  nodes: FileSystemNode[];
  toggleOpen: () => void;
}) => {
  return (
    <div className="flex bg-[#E9E3E2] h-screen pt-10 flex-row-reverse justify-between">
      <div onClick={toggleOpen}>
        <IoIosArrowBack />
      </div>
      <div className="mt-5">
        <WritingNav nodes={nodes} />
      </div>
    </div>
  );
};

export default MobileNav;
