import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Search, Award, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';

const CertificateValidator = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_code', code.trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Certificate not found. Please check the code and try again.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <SEO title="Verify Certificate | Aspivox" description="Verify the authenticity of an Aspivox student certificate." />
      
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="z-10 w-full max-w-lg space-y-8 text-center mt-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-primary/20">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-foreground">Certificate Verification</h1>
          <p className="text-muted-foreground font-light">Enter the unique alphanumeric ID found on the certificate to verify its authenticity.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border border-border shadow-2xl rounded-[2rem] overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g., ASP-ABCD-1234"
                  className="pl-12 h-14 bg-background border-border rounded-2xl text-lg font-mono uppercase tracking-widest shadow-inner placeholder:normal-case placeholder:tracking-normal"
                />
              </div>
              <Button disabled={loading || !code} type="submit" className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                {loading ? 'Verifying...' : 'Verify Authenticity'}
              </Button>
            </form>

            {error && (
              <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center text-destructive animate-in fade-in zoom-in duration-300">
                <XCircle className="w-12 h-12 mb-3" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Verification Failed</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center text-green-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CheckCircle2 className="w-16 h-16 mb-4 shadow-xl rounded-full" />
                <Badge className="bg-green-500 text-white hover:bg-green-600 mb-4 tracking-widest uppercase text-[10px]">Verified Authentic</Badge>
                
                <div className="space-y-4 w-full mt-2">
                  <div className="bg-background/50 rounded-xl p-4 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Student Name</span>
                    <span className="text-xl font-display font-bold text-foreground mt-1">{result.student_name}</span>
                  </div>
                  
                  <div className="bg-background/50 rounded-xl p-4 flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course Completed</span>
                    <span className="text-lg font-bold text-primary mt-1 text-center">{result.course_name}</span>
                  </div>
                  
                  <div className="flex justify-between w-full px-4 text-xs text-muted-foreground font-mono mt-4">
                    <span>Issued: {new Date(result.issued_at).toLocaleDateString()}</span>
                    <span>ID: {result.certificate_code}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateValidator;
