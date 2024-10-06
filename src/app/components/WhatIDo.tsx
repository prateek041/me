const WhatIDo = () => {
  return (
    <div className="space-y-10">
      <div className="text-3xl">I can Help you with</div>
      <div className="grid grid-cols-3 gap-x-2">
        {pageContent.map((item, index) => {
          return (
            <SkillCard
              key={index}
              index={item.index}
              heading={item.heading}
              content={item.content}
            />
          );
        })}
      </div>
    </div>
  );
};

const pageContent = [
  {
    index: "01",
    heading: "Web Development",
    content: `I’m a Full stack Engineer with experience of building web applications using Go, React (JS/TS), NextJS, and NodeJS.

I am Familiar with both NoSQL (MongoDB) and SQL Databases and experienced with building REST as well as GraphQL Backends following microservices architecture.`,
  },
  {
    index: "02",
    heading: "Cloud Native and DevOps",
    content: `I have about 2 years of experience with cloud native technologies like Kubernetes, deploying applications and extending Kubernetes as a platform.

I have contributed code to major Open Source projects like Cilium and Dapr.`,
  },
  {
    index: "03",
    heading: "Content Writing",
    content: `I have been writing Tech Content on my Personal Blog  as well as a Ghost Writer for about 3 years now, which are published on Hashnode as well as Here.

The articles have been featured on multiple platforms and are diverse, ranging from Web Development, Kubernetes, Cloud Native Development, eBPF etc.`,
  },
];

const SkillCard = ({
  index,
  heading,
  content,
}: {
  index: string;
  heading: string;
  content: string;
}) => {
  return (
    <div className="border-l border-[#FAF0E6] px-4 space-y-5">
      <div className="md:text-6xl text-4xl opacity-45">{index}</div>
      <div className="text-2xl">{heading}</div>
      <div>{content}</div>
    </div>
  );
};

export default WhatIDo;
