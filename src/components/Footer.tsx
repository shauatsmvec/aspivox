import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-20 border-t border-border bg-card">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-12">
        {/* Logo & info */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl italic">A</span>
            </div>
            <span className="text-2xl font-black font-display tracking-tighter text-foreground uppercase italic">
              Aspi<span className="text-primary">vox</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-4 font-light">Start Today — State Tomorrow</p>
          <p className="text-muted-foreground/60 text-[10px] uppercase tracking-widest font-bold">MSME Registered | © 2025 Aspivox. All rights reserved.</p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-foreground font-bold mb-6 font-display uppercase tracking-widest text-xs">Quick Links</h4>
          <div className="space-y-3">
            {["Home", "Courses", "Internship", "About", "Contact"].map((link) => (
              <Link
                key={link}
                to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                className="block text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-foreground font-bold mb-6 font-display uppercase tracking-widest text-xs">Follow Us</h4>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/aspivox/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.threads.net/@aspivox_edutech" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-primary/20">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.723 2.082-1.12 3.476-1.15 1.005-.02 1.94.117 2.793.404-.08-.545-.224-1.03-.43-1.44-.486-.965-1.375-1.455-2.641-1.455h-.045c-.876.012-1.612.305-2.127.848l-1.452-1.403c.836-.872 1.98-1.346 3.31-1.37h.062c1.986 0 3.439.846 4.225 2.455.414.849.655 1.87.72 3.04.345.19.665.4.96.634 1.19.94 1.988 2.2 2.418 3.466.588 1.731.51 4.262-1.624 6.345-1.874 1.828-4.14 2.607-7.332 2.631zM11.89 13.87c-1.033.03-1.818.282-2.33.745-.453.41-.653.93-.617 1.592.048.847.478 1.485 1.242 1.844.624.293 1.39.42 2.16.375 1.07-.058 1.876-.46 2.395-1.197.382-.544.648-1.27.77-2.136-.654-.26-1.39-.403-2.197-.42-.147-.004-.288-.005-.423-.003z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
