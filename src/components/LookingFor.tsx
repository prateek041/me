import Contact from "./Contact";
import * as motion from "framer-motion/client";

const LookingFor = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="pb-20"
    >
      <div className="space-y-20 ">
        <div className="space-y-5">
          <h1 className="text-5xl w-4/5">
            {"I'm looking forward to work with"}
          </h1>
          <div className="p-5">
            <ul className="list-disc">
              {lookingforContent.map(content => {
                return (
                  <li key={content} >
                    <LookingForItem item={content} />
                  </li>
                )
              })}
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
    </motion.div>
  );
};

const lookingforContent = [
  "Developer Relations",
  "eBPF, Observability and Kernel Engineering",
  "AI powered product development"
]

const LookingForItem = ({ item }: { item: string }) => {
  return (
    <h2 className="text-2xl">{item}</h2>
  )
}

export default LookingFor;
