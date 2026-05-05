import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    enrollments: 0,
    applications: 0,
    contacts: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, e, a, c] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('internship_applications').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        students: s.count || 0,
        enrollments: e.count || 0,
        applications: a.count || 0,
        contacts: c.count || 0
      });
      
      if (s.error || e.error || a.error || c.error) {
        console.error('Data fetch error:', { s: s.error, e: e.error, a: a.error, c: c.error });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Students', value: stats.students, icon: Users, link: '/admin/students', color: 'text-cyan' },
    { title: 'Enrollments', value: stats.enrollments, icon: BookOpen, link: '/admin/enrollments', color: 'text-primary' },
    { title: 'Applications', value: stats.applications, icon: FileText, link: '/admin/applications', color: 'text-cyan' },
    { title: 'Messages', value: stats.contacts, icon: MessageSquare, link: '/admin/contacts', color: 'text-primary' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold font-display uppercase text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your platform data and users.</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="rounded-xl border-border">Refresh Data</Button>
      </div>

      {!isAdmin && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive">
          <p className="font-bold">ADMIN ACCESS RESTRICTED</p>
          <p className="text-sm">Your account ({user?.email}) is not recognized as an admin by the database policies.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="bg-card border-border rounded-2xl hover:bg-accent transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold font-display text-foreground">{card.value}</div>
              )}
              <Link to={card.link} className="flex items-center text-[10px] font-bold uppercase tracking-widest mt-4 text-primary hover:underline">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-display uppercase">System Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Admin Identity</span>
              <Badge className={isAdmin ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                {isAdmin ? "Verified" : "Restricted"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">User Email</span>
              <span className="text-xs font-mono">{user?.email || 'Not logged in'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-display uppercase">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button asChild variant="outline" className="w-full justify-start rounded-xl">
              <Link to="/admin/stats">Manage Website Stats</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl">
              <Link to="/">Go to Website</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
