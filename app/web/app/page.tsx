import { BestReviewedProducts } from "@/components/BestReviewedProducts";
import { CustomerStoriesSlider } from "@/components/CustomerStoriesSlider";
import { ExclusiveOffers } from "@/components/ExclusiveOffers";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/components/LandingPage";
import { MotionReveal } from "@/components/MotionReveal";
import { Navbar } from "@/components/Navbar";
import { WhyAgentica } from "@/components/WhyAgentica";

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
      <MotionReveal>
        <WhyAgentica />
      </MotionReveal>
      <MotionReveal>
        <BestReviewedProducts />
      </MotionReveal>
      <MotionReveal>
        <CustomerStoriesSlider />
      </MotionReveal>
      <MotionReveal>
        <ExclusiveOffers />
      </MotionReveal>
      <Footer />
    </>
  );
}
