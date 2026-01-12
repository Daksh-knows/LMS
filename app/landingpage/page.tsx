import IntensiveUpgrades from "./components/IntensiveUpgrades";
import TrainerAlumni from "./components/TrainerAlumni";
import SuccessStories from "./components/SuccessStories";
import DoubtsClarified from "./components/DoubtsClarified";
import Dashboard1 from "./components/Dashboard1";
import Dashboard2 from "./components/DashBoard2";
import HiringCompanies from "./components/HiringCompanies";
import GetCertified from "./components/GetCertified";
import CareerPathway from "./components/CareerPathway";
import WhyJoinIntensive from "./components/WhyJoinIntensive";
import AwardSlider from "./components/AwardSlider";

export default function LandingPage() {
  return (
    <>
      <Dashboard1 />
      <IntensiveUpgrades />
      <TrainerAlumni />
      <SuccessStories />
      <DoubtsClarified />
      <Dashboard2 />
      <CareerPathway />
      <HiringCompanies />
      <GetCertified />
      <WhyJoinIntensive />
      <AwardSlider />
    </>
  );
}
