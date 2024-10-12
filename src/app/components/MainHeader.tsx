const MainHeader = () => {
  return (
    <div className="md:h-4/5 md:grid md:grid-cols-10 flex  mt-32 flex-col gap-y-10">
      <div className="md:col-span-8 md:self-end lg:text-[220px] md:text-9xl text-6xl">
        Software Engineer
      </div>
      <div className="md:col-start-9 md:col-span-2 md:self-end md:text-2xl md:w-full w-1/2">
        working with <b>Open Source</b>, <b>Web Development</b>,{" "}
        <b>Cloud Native</b> and <b>Artificial Intelligence</b>
      </div>
    </div>
  );
};

export default MainHeader;
