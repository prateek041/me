"use client";

import TypeWriter from "typewriter-effect";
import { motion } from "framer-motion";

const MainHeader = () => {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      <div className="md:h-4/5 md:grid md:grid-cols-10 flex  mt-32 flex-col gap-y-10">
        <div className="md:col-span-8 md:self-end lg:text-[220px] md:text-9xl text-6xl">
          <TypeWriter
            onInit={(typewriter) => {
              typewriter.typeString("Software Engineer").pauseFor(1000).start();
            }}
          />
        </div>
        <div className="md:col-start-9 md:col-span-2 md:self-end md:text-2xl md:w-full w-1/2">
          <motion.div
            animate={{ x: 20 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            working with <b>Open Source</b>, <b>Web Development</b>,{" "}
            <b>Cloud Native</b> and <b>Artificial Intelligence</b>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MainHeader;
