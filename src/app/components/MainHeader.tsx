import Contact from "./Contact";

const MainHeader = () => {
  return (
    <div className="flex mt-32 flex-col gap-y-10">
      <div className="text-9xl">Software Engineer</div>
      <div className="w-1/2">
        working with <b>Open Source</b>, <b>Web Development</b>,{" "}
        <b>Cloud Native</b> and <b>Artificial Intelligence</b>
      </div>
      <Contact />
    </div>
  );
};

export default MainHeader;
