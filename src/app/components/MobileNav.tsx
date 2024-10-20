"use client";

import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import WritingNav from "./WritingNav";
import { FileSystemNode } from "../writings/api/blog";
import { IoIosArrowBack } from "react-icons/io";

const MobileNav = ({ nodes }: { nodes: FileSystemNode[] }) => {
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="container fixed h-full mx-auto px-5">
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
      className="bg-[#352F44] w-fit mt-10 p-2 rounded-r-lg"
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
    <div className="flex bg-[#352F44] h-full pt-10 flex-row-reverse justify-between">
      <div onClick={toggleOpen}>
        <IoIosArrowBack />
      </div>
      <div className="mt-5">
        <WritingNav isMobile={true} nodes={nodes} />
      </div>
    </div>
  );
};

export default MobileNav;