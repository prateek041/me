import Link from "next/link";
import * as motion from "framer-motion/client";

const MyWork = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <div>
        <div>
          <h2 className="text-3xl border-b border-b-[black] md:pb-10 pb-5">
            My Work
          </h2>
        </div>
        <div>
          {PageContent.map((item, index) => {
            return (
              <WorkItem
                key={index}
                link={item.link}
                heading={item.heading}
                description={item.description}
                tech={item.tech}
                year={item.year}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const PageContent = [
  {
    link: "https://github.com/Senseii-ai",
    heading: "Senseii",
    description: "AI driven Health and Fitness App",
    tech: "NextJS(Typescript), NodeJS, LangChain, Openai, Mongodb",
    year: "/23",
  },
  {
    link: "https://github.com/cilium/tetragon",
    heading: "Tetragon",
    description: "eBPF-based Security Observability and Runtime Enforcement",
    tech: "Go, eBPF, Kubernetes, Helm, CI/CD, Docker",
    year: "/23",
  },
  {
    link: "https://github.com/dapr/dapr",
    heading: "Dapr",
    description:
      "A portable, event-driven, runtime for building distributed applications across cloud and edge.",
    tech: "Go, Docker, microservices, PubSub, event-driven, Action Model, Prometheus.",
    year: "/23",
  },
];

const WorkItem = ({
  link,
  heading,
  description,
  tech,
  year,
}: {
  link: string;
  heading: string;
  description: string;
  tech: string;
  year: string;
}) => {
  return (
    <div className="py-10 grid grid-cols-8 border-b-[0.2px] border-b-[black]">
      <div className="col-span-7 space-y-5">
        <Link href={link}>
          <h2 className="underline underline-offset-8 md:text-7xl text-4xl">
            {heading}
          </h2>
        </Link>
        <div className="space-y-2">
          <h3 className="md:text-2xl text-lg">{description}</h3>
          <h2 className="font-light text-sm">{tech}</h2>
        </div>
      </div>
      <div className="col-start-8">
        <div className="flex h-full items-center justify-center">
          <h1 className="md:text-6xl text-3xl">{year}</h1>
        </div>
      </div>
    </div>
  );
};

export default MyWork;
