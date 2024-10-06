import Socials from "./Socials";
import WhatIDo from "./WhatIDo";

const About = () => {
  return (
    <div className="flex flex-col gap-y-16">
      <div className="grid grid-cols-8">
        <div className="md:col-span-4  col-span-5">
          <h2 className="text-4xl">
            I’m a builder from India with about 2 years of experience with Web
            Technologies, Cloud Native, Open Source and Content writing.
          </h2>
        </div>
        <div className="col-start-7 col-end-9">
          <Socials />
        </div>
      </div>
      <WhatIDo />
    </div>
  );
};

export default About;
