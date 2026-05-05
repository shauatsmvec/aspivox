import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEnrollments: 0,
    pendingInternships: 0,
    newContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const fetchCount = async (table: string, filter?: (query: any) => any) => {
          let query = supabase.from(table).select('*', { count: 'exact', head: true });
          if (filter) query = filter(query);
          const { count, error } = await query;
          if (error) {
            console.error(`Error fetching count for ${table}:`, error);
            return 0;
          }
          return count || 0;
        };

        const [totalStudents, totalEnrollments, pendingInternships, newContacts] = await Promise.all([
          fetchCount('students'),
          fetchCount('enrollments'),
          fetchCount('internship_applications', (q) => q.eq('status', 'pending')),
          fetchCount('contact_submissions', (q) => 
            q.gt('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          ),
        ]);

        setStats({
          totalStudents,
          totalEnrollments,
          pendingInternships,
          newContacts,
        });
      } catch (error) {
        console.error('Unexpected error in fetchAdminStats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <div className="p-8 text-muted-foreground font-light">Loading stats...</div>;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-cyan', link: '/admin/students' },
    { title: 'Total Enrollments', value: stats.totalEnrollments, icon: BookOpen, color: 'text-primary', link: '/admin/enrollments' },
    { title: 'Pending Internships', value: stats.pendingInternships, icon: FileText, color: 'text-cyan', link: '/admin/applications' },
    { title: 'New Contacts (7d)', value: stats.newContacts, icon: MessageSquare, color: 'text-primary', link: '/admin/contacts' },
  ];

  return (
    <div className="space-y-10 text-foreground">
      <div>
        <h1 className="text-4xl font-bold font-display uppercase tracking-tight text-foreground">Admin Overview</h1>
        <p className="text-muted-foreground mt-2 font-light">Welcome to the Aspivox control panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card border-border text-foreground rounded-2xl hover:bg-accent transition-all group shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{card.value}</div>
              <Link to={card.link} className="text-[10px] font-bold text-cyan hover:text-primary uppercase tracking-widest flex items-center mt-4 transition-colors">
                View Details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-xl font-display uppercase tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-6">
            <Button asChild variant="outline" className="justify-start border-border hover:bg-accent h-12 rounded-xl text-muted-foreground">
              <Link to="/admin/stats" className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Manage Site Counters
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start border-border hover:bg-accent h-12 rounded-xl text-muted-foreground">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan" />
                Go to Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
