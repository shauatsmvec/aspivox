import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '../types/database';

type StudentProfile = Database['public']['Tables']['students']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    college: string;
    city: string;
  }) => Promise<{ error: any }>;
  signIn: (data: { email: string; password: any }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const adminEmail = 'shahid.aspivox@zohomail.in'.toLowerCase().trim();

  const fetchStudentProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single();
      return error ? null : data;
    } catch {
      return null;
    }
  };

  const handleAuthStateChange = async (currentSession: Session | null, event: string = 'initial') => {
    const currentUser = currentSession?.user ?? null;
    console.log('Auth state change detected:', { event, email: currentUser?.email });
    setSession(currentSession);
    setUser(currentUser);
    
    if (currentUser) {
      const isUserAdmin = currentUser.email?.toLowerCase().trim() === adminEmail;
      console.log('Admin check:', { userEmail: currentUser.email?.toLowerCase().trim(), targetAdmin: adminEmail, isMatch: isUserAdmin });
      setIsAdmin(isUserAdmin);
      const profile = await fetchStudentProfile(currentUser.id);
      setStudentProfile(profile);
    } else {
      setIsAdmin(false);
      setStudentProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If Supabase doesn't respond in 5 seconds, stop loading
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out. Checking local session...');
        setLoading(false);
      }
    }, 5000);

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Actively verify the user exists on the server to catch deleted accounts
          const { error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('Session exists but user is invalid/deleted. Purging session.');
            await supabase.auth.signOut();
            if (mounted) await handleAuthStateChange(null, 'INVALID_SESSION');
            return;
          }
        }

        if (mounted) await handleAuthStateChange(session, 'INITIAL');
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase onAuthStateChange:', event);
      if (mounted) {
        await handleAuthStateChange(session, event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setStudentProfile(null);
          setIsAdmin(false);
        }
      }
    });

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async ({ email, password, full_name, phone, college, city }: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone, college, city } }
    });
  };

  const signIn = async ({ email, password }: any) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      // Force clear state regardless of network success
      setUser(null);
      setSession(null);
      setStudentProfile(null);
      setIsAdmin(false);
    }
  };

  const value = {
    user,
    session,
    studentProfile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
