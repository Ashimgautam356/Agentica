import { BestReviewedProducts } from "@/components/BestReviewedProducts";
import { CustomerStoriesSlider } from "@/components/CustomerStoriesSlider";
import { ExclusiveOffers } from "@/components/ExclusiveOffers";
import { LandingPage } from "@/components/LandingPage";
import { Navbar } from "@/components/Navbar";
import { WhyAgentica } from "@/components/WhyAgentica";

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <WhyAgentica />
      <BestReviewedProducts />
      <CustomerStoriesSlider />
      <ExclusiveOffers />
    </>
  );
}
