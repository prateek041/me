"use client";

import TypeWriter from "typewriter-effect";
import { motion } from "framer-motion";
import { Card } from "./ui/card";

const MainHeader = () => {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: -1 }}
      transition={{ duration: 1 }}
    >
      <div className="md:h-4/5 md:grid md:grid-cols-10 flex mt-32 flex-col gap-y-10">
        <div className="md:col-span-8 md:self-end xl:text-[220px] lg:text-[150px] md:text-9xl text-6xl">
          <div
            style={{
              transform: `translate3d(0px, 0%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d`,
            }}
          >
            Software Engineer
          </div>
        </div>
        <div className="md:col-start-9 md:col-span-2 md:self-end lg:text-2xl md:text-xl md:w-full w-1/2">
          <motion.div
            animate={{ x: 20 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            working with
            <TypeWriter
              onInit={(typewriter) => {
                typewriter
                  .typeString(
                    `<b>Open Source</b>, <b>Full Stack Product Development</b>
            and <b>Artificial Intelligence</b>
  .`,
                  )
                  .start();
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MainHeader;
