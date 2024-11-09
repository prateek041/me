import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import Navbar from "./components/Navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: "Prateek Singh",
  description: "A public diary of my Life",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await new Promise((resolve, reject) => {
    return setTimeout(resolve, 5000);
  });

  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} bg-[#E9E3E2] md:px-0 px-5 w-full md:h-screen `}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
