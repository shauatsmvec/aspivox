import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoursesSection from "@/components/CoursesSection";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <CoursesSection />
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
