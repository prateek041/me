import Link from "next/link";

const Socials = () => {
  return (
    <div className="md:text-base text-sm">
      <div>{"Let's get connected"}</div>
      <div className="flex flex-col">
        <Link href={"https://www.linkedin.com/in/prateek-singh-903449211/"}>
          Linkedin
        </Link>
        <Link href={"https://x.com/prateek_0041"}>X</Link>
        <Link href={"https://github.com/prateek041"}>GitHub</Link>
      </div>
    </div>
  );
};

export default Socials;
