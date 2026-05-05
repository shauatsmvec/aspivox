import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    college: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email to confirm.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex items-center justify-center pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/5 blur-[120px] rounded-full pointer-events-none" />

        <Card className="w-full max-w-2xl bg-card backdrop-blur-xl border-border text-foreground shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pt-10 pb-6 text-center">
            <CardTitle className="text-3xl font-display uppercase tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground font-light">Join Aspivox and start your learning journey today.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6 px-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Full Name</Label>
                  <Input id="full_name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} required className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="bg-background border-border text-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Phone Number</Label>
                  <Input id="phone" placeholder="+91 0000000000" value={formData.phone} onChange={handleChange} required className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">College Name</Label>
                  <Input id="college" placeholder="Your College" value={formData.college} onChange={handleChange} required className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-muted-foreground uppercase tracking-widest">City</Label>
                  <Input id="city" placeholder="Your City" value={formData.city} onChange={handleChange} required className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 p-10">
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <p className="text-sm text-center text-muted-foreground font-light">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan font-bold hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
