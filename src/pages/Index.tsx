import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import InternshipSection from "@/components/InternshipSection";
import AchievementsSection from "@/components/AchievementsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TeamSection from "@/components/TeamSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => (
  <div className="min-h-screen">
    <SEO title="Aspivox | Start Today, State Tomorrow" description="Elevating education through expert-led courses and hands-on internship opportunities." />
    <Navbar />
    <HeroSection />
    <AboutSection />
    <CoursesSection limit={6} />
    <InternshipSection />
    <AchievementsSection />
    <HowItWorksSection />
    <TeamSection />
    <VisionMissionSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Index;
