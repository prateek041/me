import About from "./components/About";
import MainHeader from "./components/MainHeader";

export default function Home() {
  return (
    <div className="container mx-auto space-y-20">
      <MainHeader />
      <About />
    </div>
  );
}
