import Link from "next/link";

const Contact = () => {
  return (
    <div className="bg-[#FAF0E6] px-4 py-2 w-fit rounded-lg">
      <Link
        href="mailto:prateeksingh9741@gmail.com"
        className="flex gap-x-2
        items-center"
      >
        <h1 className="text-[#352F44]">Connect with me</h1>
        <div className="rounded-full bg-[#352F44] h-3 w-3"></div>
      </Link>
    </div>
  );
};

export default Contact;
