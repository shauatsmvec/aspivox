import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoursesSection from "@/components/CoursesSection";
import SEO from "@/components/SEO";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Courses | Aspivox" description="Explore our catalog of professional courses including Python, Java, Data Science, and more." />
      <Navbar />
      <div className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold font-display uppercase tracking-tight text-foreground mb-4">
            Full Course <span className="text-primary">Catalog</span>
          </h1>
          <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
            Explore our complete range of mentor-led programs designed to bridge the gap between academics and industry.
          </p>
        </div>
        <CoursesSection isFullView />
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
