import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import SEO from "@/components/SEO";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Contact Us | Aspivox" description="Get in touch with us for inquiries, support, or feedback." />
      <Navbar />
      <div className="pt-20">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
