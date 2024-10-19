import About from "./components/About";
import LookingFor from "./components/LookingFor";
import MainHeader from "./components/MainHeader";
import MyWork from "./components/MyWork";

export default function Home() {
  return (
    <div className="container md:h-full mx-auto md:spacey2 space-y-20 pb-10">
      <MainHeader />
      <About />
      <MyWork />
      <LookingFor />
    </div>
  );
}
