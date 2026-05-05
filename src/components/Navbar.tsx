import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", href: "home" },
  { name: "About", href: "about" },
  { name: "Courses", href: "courses" },
  { name: "Internship", href: "internship" },
  { name: "Contact", href: "contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, signOut, studentProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      // Force a full page reload and redirect to home to clear all states
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/';
    }
  };

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="text-primary-foreground font-black text-xl italic">A</span>
            </div>
            <span className="text-2xl font-black font-display tracking-tighter text-foreground uppercase italic">
              Aspi<span className="text-primary">vox</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* CTA / Auth */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border hover:bg-accent">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{studentProfile?.full_name || 'Student'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground">
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-accent focus:text-foreground">
                      <Link to="/admin" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-primary text-primary-foreground font-bold px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            {user && (
              <Link to="/dashboard" className="text-muted-foreground">
                <LayoutDashboard size={24} />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-4 pt-4 pb-8 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-3 text-lg font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </button>
            ))}
            {!user ? (
              <div className="pt-4 border-t border-border">
                <Button asChild className="w-full bg-primary text-primary-foreground font-bold h-14 rounded-2xl shadow-lg shadow-primary/20">
                  <Link to="/login" onClick={() => setIsOpen(false)}>Login / Sign Up</Link>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full border-border text-foreground h-14 rounded-2xl"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
