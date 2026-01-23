
import Image from "next/image";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Explore from "./_components/Explore";
import FAQ from "./_components/FAQ";
import MinimalFooter from "./_components/MinimalFooter";

export default function Home() {
  return (
    <div className="bg-background min-h-screen scroll-smooth">
      <Header />
      <Hero />
      {/* <Explore />
      <FAQ />
      <MinimalFooter /> */}
    </div>
  );
}
