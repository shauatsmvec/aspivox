import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { label: 'Courses', icon: BookOpen, href: '/admin/courses' },
    { label: 'Team', icon: Users, href: '/admin/team' },
    { label: 'Students', icon: Users, href: '/admin/students' },
    { label: 'Enrollments', icon: BookOpen, href: '/admin/enrollments' },
    { label: 'Applications', icon: FileText, href: '/admin/applications' },
    { label: 'Contacts', icon: MessageSquare, href: '/admin/contacts' },
    { label: 'Instructors', icon: Users, href: '/admin/instructors' },
    { label: 'Site Stats', icon: BarChart3, href: '/admin/stats' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col backdrop-blur-xl">
        <div className="p-8 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold font-display uppercase tracking-tight text-foreground">Admin</span>
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                location.pathname === item.href ? "text-primary-foreground" : "text-primary group-hover:text-primary"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-border">
          <Button asChild variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 text-primary" />
              Main Website
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative bg-background">
        {/* Admin Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {menuItems.find(m => m.href === location.pathname)?.label || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-[10px] font-bold text-foreground uppercase">{user?.email}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Administrator</p>
            </div>
            <ThemeToggle />
            <Button onClick={() => signOut()} variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="p-10 flex-grow relative">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
