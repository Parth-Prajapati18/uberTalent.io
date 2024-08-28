
import Hero from "./components/landing/Hero";
import Nav from "./components/ui/nav/LandingPageNav";
import HomepageStats from "./components/landing/HomepageStats";
import FindTopTalent from "./components/landing/FindTopTalent";
import Footer from "./components/ui/Footer";
import Partners from "./components/landing/Partners";
import WorkTheWayYouLove from "./components/landing/WorkTheWayYouLove";
import SparkOpsTestimonial from "./components/landing/SparkOpsTestimonial";
import BrowseTalentBySkills from "./components/landing/BrowseTalentBySkills";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="bg-white">
        <main>
          <Hero />
          <HomepageStats />
          <BrowseTalentBySkills />
          <Partners />
          <SparkOpsTestimonial />
          <WorkTheWayYouLove />
        </main>
        <Footer />
      </div>
    </>
  );
}
