"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Navlinks = [
  {
    url: "/writings/tech",
    title: "Tech",
  },
  {
    url: "/writings/thoughts",
    title: "Thoughts",
  },
  {
    url: "/writings/life",
    title: "Life",
  },
];
const WritingNav = () => {
  const pathName = usePathname();
  const route = pathName.split("/");

  const [isActive, setIsActive] = useState(2);

  useEffect(() => {
    Navlinks.map((item, index) => {
      if (item.title.toLowerCase() === route[route.length - 1]) {
        setIsActive(index);
      }
    });
  }, []);

  return (
    <div className="flex h-full justify-center gap-x-5 border-r border-[#FAF0E6]">
      {Navlinks.map((item, index) => {
        return (
          <NavItem
            key={index}
            url={item.url}
            index={index}
            isActive={isActive}
            title={item.title}
          />
        );
      })}
    </div>
  );
};

const NavItem = ({
  index,
  isActive,
  url,
  title,
}: {
  index: number;
  isActive: number;
  url: string;
  title: string;
}) => {
  return (
    <Link
      className={isActive === index ? "underline font-semibold" : ""}
      href={url}
    >
      {title}
    </Link>
  );
};

export default WritingNav;
