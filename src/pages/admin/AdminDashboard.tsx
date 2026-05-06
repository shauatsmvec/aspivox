import React from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, MessageSquare, ArrowRight, Download, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [isBackingUp, setIsBackingUp] = React.useState(false);
  const { data: stats = { students: 0, enrollments: 0, applications: 0, contacts: 0 }, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async () => {
      const [sData, e, a, c, iData] = await Promise.all([
        supabase.from('students').select('email'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('internship_applications').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('instructors').select('email')
      ]);

      const instructorEmails = new Set((iData.data || []).map(i => i.email));
      const trueStudentCount = (sData.data || []).filter(s => s.email && !instructorEmails.has(s.email)).length;

      return {
        students: trueStudentCount,
        enrollments: e.count || 0,
        applications: a.count || 0,
        contacts: c.count || 0
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const cards = [
    { title: 'Total Students', value: stats.students, icon: Users, link: '/admin/students', color: 'text-cyan' },
    { title: 'Enrollments', value: stats.enrollments, icon: BookOpen, link: '/admin/enrollments', color: 'text-primary' },
    { title: 'Applications', value: stats.applications, icon: FileText, link: '/admin/applications', color: 'text-cyan' },
    { title: 'Messages', value: stats.contacts, icon: MessageSquare, link: '/admin/contacts', color: 'text-primary' }
  ];

  const exportDatabaseBackup = async () => {
    setIsBackingUp(true);
    const toastId = toast.loading('Building .zip backup (this may take a moment)...');
    try {
      const tables = ['courses', 'students', 'enrollments', 'internship_applications', 'contact_submissions', 'team_members', 'site_stats', 'lms_classes', 'instructors', 'certificates'];
      const backupData: any = {};
      
      const zip = new JSZip();

      // 1. Fetch DB Data
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.warn(`Could not fetch ${table}:`, error.message);
        } else {
          backupData[table] = data;
        }
      }
      
      zip.file('data.json', JSON.stringify(backupData, null, 2));

      // 2. Fetch Images
      const imagesFolder = zip.folder('images');
      const fetchImage = async (url: string, name: string) => {
        if (!url || !url.startsWith('http')) return;
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
          imagesFolder?.file(`${name}.${ext}`, blob);
        } catch (e) {
          console.error('Failed to download image:', url);
        }
      };

      const imagePromises: Promise<void>[] = [];
      if (backupData.team_members) {
        backupData.team_members.forEach((m: any, i: number) => {
           if (m.image_url) imagePromises.push(fetchImage(m.image_url, `team_${m.id || i}`));
        });
      }
      if (backupData.instructors) {
        backupData.instructors.forEach((m: any, i: number) => {
           if (m.image_url) imagePromises.push(fetchImage(m.image_url, `instructor_${m.id || i}`));
        });
      }
      await Promise.all(imagePromises);

      // 3. Generate Schema Summary
      const schemaSummary = {
        tables: tables,
        notes: "Schema aligns with database.ts definitions. Exported natively from client."
      };
      zip.file('schema.json', JSON.stringify(schemaSummary, null, 2));

      // 4. Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aspivox_full_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Database backup exported successfully!', { id: toastId });
    } catch (err: any) {
      toast.error('Failed to export backup: ' + err.message, { id: toastId });
    } finally {
      setIsBackingUp(false);
    }
  };

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

        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl md:col-span-2">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-display uppercase flex items-center gap-2"><Database className="w-5 h-5 text-primary" /> Database Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Download a complete JSON export of all database tables including schema and data. Keep this safe to easily migrate or restore your platform.</p>
            <Button disabled={isBackingUp} onClick={exportDatabaseBackup} className="bg-primary text-primary-foreground font-bold h-12 px-6 rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20">
              <Download className="w-4 h-4 mr-2" /> {isBackingUp ? 'Exporting...' : 'Export Database Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
