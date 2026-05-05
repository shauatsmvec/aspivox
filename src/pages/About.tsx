import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import TeamSection from "@/components/TeamSection";
import VisionMissionSection from "@/components/VisionMissionSection";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <AboutSection />
        <VisionMissionSection />
        <TeamSection />
      </div>
      <Footer />
    </div>
  );
};

export default About;
