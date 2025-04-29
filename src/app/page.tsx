"use client";

import About from "@/components/About";
import LookingFor from "@/components/LookingFor";
import MainHeader from "@/components/MainHeader";
import MyWork from "@/components/MyWork";
import { useTheme } from "next-themes";

export default function Home() {
  const theme = useTheme();
  if (!theme) {
    return;
  }
  return (
    <div className="container md:h-full mx-auto md:spacey2 space-y-20 pb-10">
      <div className="absolute w-full h-full inset-0">
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${theme?.theme === "light" ? "to-background/100" : "to-background/90"}`} />
        {/* <video */}
        {/*   src={theme?.theme === "light" ? "/ascii-dark.mp4" : "/ascii-light.mp4"} */}
        {/*   autoPlay={true} */}
        {/*   loop={true} */}
        {/*   muted={true} */}
        {/*   className="h-full w-full object-cover" */}
        {/* /> */}
      </div>
      <MainHeader />
      <About />
      <MyWork />
      <LookingFor />
    </div>
  );
}
