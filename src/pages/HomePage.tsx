import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PipelineFlow from "../components/PipelineFlow";
import FeaturedJobs from "../components/FeaturedJobs";
import AudienceSplit from "../components/AudienceSplit";
import StatsBand from "../components/StatsBand";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper font-body">
      <Navbar />
      <Hero />
      <PipelineFlow />
      <FeaturedJobs />
      <AudienceSplit />
      <StatsBand />
      <CTASection />
      <Footer />
    </div>
  );
}
