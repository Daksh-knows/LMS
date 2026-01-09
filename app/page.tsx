import Image from "next/image";
import IntensiveUpgrades from "@/components/IntensiveUpgrades";
import TrainerAlumni from "@/components/TrainerAlumni";
import SuccessStories from "@/components/SuccessStories";
import DoubtsClarified from "@/components/DoubtsClarified";
export default function Home() {
  return (
    <>
      <IntensiveUpgrades />
      <TrainerAlumni />
      <SuccessStories />
      <DoubtsClarified />
    </>
  );
}
