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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} bg-[#352F44] text-[#FAF0E6] md:h-screen w-full`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
