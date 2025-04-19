import Link from "next/link";

const Contact = () => {
  return (
    <div className="px-4 bg-black py-2 w-fit rounded-lg">
      <Link
        href="mailto:prateeksingh9741@gmail.com"
        className="flex gap-x-2
        items-center"
      >
        <h1 className="text-white">Connect with me</h1>
        <div className="rounded-full bg-[white] h-3 w-3"></div>
      </Link>
    </div>
  );
};

export default Contact;
