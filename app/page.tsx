import Dashboard1 from "@/component/Dashboard1";
import DashBoard2 from "@/component/DashBoard2";
import GetCertified from "@/component/GetCertified";
import Hero from "@/component/Hero";
import HiringCompanies from "@/component/HiringCompanies";
import Navbar from "@/component/Navigation";
import ProgramHighlights from "@/component/ProgramHighlights";
import WhyJoinIntensive from "@/component/WhyJoinIntensive";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Dashboard1 />
      <DashBoard2 />
      <HiringCompanies />
      <GetCertified />
      <WhyJoinIntensive />
    </>
  );
}
