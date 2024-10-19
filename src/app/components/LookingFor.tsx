import Contact from "./Contact";

const LookingFor = () => {
  return (
    <div className="space-y-20 ">
      <div className="space-y-5">
        <h1 className="text-5xl w-4/5">{"I'm looking forward to work with"}</h1>
        <div className="p-5">
          <ul className="list-disc">
            <li>
              <h2>Developer Relations</h2>
            </li>
            <li>
              <h2>Cloud Native Products</h2>
            </li>
            <li>
              <h2>eBPF, Observability and Kernel Engineering</h2>
            </li>
            <li>
              <h2>AI powered product Development</h2>
            </li>
          </ul>
        </div>
      </div>
      <div className="md:grid md:grid-cols-3 flex flex-col gap-y-10">
        <h1 className="md:col-span-2 col-span-7 md:text-6xl text-4xl">
          Let’s talk about a project, collaboration or an idea you may have
        </h1>
        <div className="md:col-start-4 col-start-8">
          <Contact />
        </div>
      </div>
    </div>
  );
};

export default LookingFor;
