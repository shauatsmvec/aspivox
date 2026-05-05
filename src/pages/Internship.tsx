import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InternshipSection from "@/components/InternshipSection";

const Internship = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <InternshipSection />
      </div>
      <Footer />
    </div>
  );
};

export default Internship;
