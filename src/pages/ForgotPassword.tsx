import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display uppercase mb-2">Check your email</CardTitle>
          <CardDescription className="mb-8">
            We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
          </CardDescription>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link to="/login">Back to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card border-border rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 pb-0">
          <Button asChild variant="ghost" className="mb-6 p-0 hover:bg-transparent text-muted-foreground hover:text-primary">
            <Link to="/login" className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </Button>
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-3xl font-display uppercase mb-2">Forgot Password</CardTitle>
            <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
          </CardHeader>
        </div>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border rounded-xl h-12 focus:ring-primary"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest hover:scale-[1.02] transition-all">
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
