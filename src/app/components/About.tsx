import Socials from "./Socials";
import WhatIDo from "./WhatIDo";
import * as motion from "framer-motion/client";

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      animate={{
        x: 0,
        backgroundColor: "rgba(53, 47, 68, 1)",

        boxShadow: "10px 10px 0 #FAF0E6",
      }}
    >
      <div className="flex flex-col gap-y-16">
        <div className="grid grid-cols-8">
          <div className="md:col-span-4  col-span-5">
            <h2 className="md:text-4xl text-2xl">
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
    </motion.div>
  );
};

export default About;
