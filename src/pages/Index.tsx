
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import LoginModal from '@/components/LoginModal';
import AdminLoginModal from '@/components/AdminLoginModal';
import Dashboard from '@/components/Dashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if current route is admin
  const isAdminRoute = location.pathname === '/admin';

  // Redirect admin users to admin dashboard automatically
  useEffect(() => {
    if (user && userProfile?.role === 'admin' && !isAdminRoute) {
      navigate('/admin');
    }
  }, [user, userProfile, isAdminRoute, navigate]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile for all authenticated users
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                setUserProfile(profile);
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session only for non-admin routes
    if (!isAdminRoute) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, [isAdminRoute]);

  const handleLogin = (userType: string, userData: any) => {
    setUser(userData);
    setUserProfile(userData.profile);
    
    // Handle admin route access
    if (isAdminRoute) {
      if (userData.profile?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      // Admin logged in on admin route - stay on admin route (don't navigate)
      return;
    }
    
    // For non-admin routes, redirect admin users to admin dashboard
    if (userData.profile?.role === 'admin' && !isAdminRoute) {
      navigate('/admin');
      return;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast({
        title: "Goodbye!",
        description: "You have been logged out successfully.",
      });
      
      if (isAdminRoute) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin route logic
  if (isAdminRoute) {
    if (!user || !userProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card-gradient p-8 rounded-lg max-w-md w-full mx-4 animate-scale-in">
            <h1 className="text-2xl font-bold text-center gradient-text mb-6">
              Admin Access Required
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              Please log in with admin credentials to access this area.
            </p>
            <AdminLoginModal 
              isOpen={true} 
              onClose={() => navigate('/')}
              onLogin={handleLogin}
            />
          </div>
        </div>
      );
    }

    if (userProfile.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card-gradient p-8 rounded-lg max-w-md w-full mx-4 animate-scale-in">
            <h1 className="text-2xl font-bold text-center text-destructive mb-4">
              Access Denied
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              You don't have permission to access the admin panel.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full btn-gradient hover:scale-105 transition-all duration-300 px-4 py-2 rounded-lg"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      );
    }

    return <AdminDashboard user={user} profile={userProfile} onLogout={handleLogout} />;
  }

  // Regular user dashboard
  if (user && userProfile) {
    return <Dashboard user={user} profile={userProfile} onLogout={handleLogout} />;
  }

  // Landing page
  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />
      <HeroSection onGetStarted={() => setShowLoginModal(true)} />
      <FeaturesSection />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
