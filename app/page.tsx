import AwardSlider from "@/components/AwardSlider";
import Dashboard1 from "@/components/Dashboard1";
import DashBoard2 from "@/components/DashBoard2";
import WhyJoinIntensive from "@/components/WhyJoinIntensive";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <Dashboard1 />
      <DashBoard2 />  
      <WhyJoinIntensive />
      <AwardSlider />
    </div>
  );
}
