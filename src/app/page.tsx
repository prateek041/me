import About from "./components/About";
import MainHeader from "./components/MainHeader";
import MyWork from "./components/MyWork";

export default function Home() {
  return (
    <div className="container mx-auto space-y-20">
      <MainHeader />
      <About />
      <MyWork />
    </div>
  );
}
