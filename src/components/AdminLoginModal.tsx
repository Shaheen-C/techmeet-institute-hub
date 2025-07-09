import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: string, userData: any) => void;
}

const AdminLoginModal = ({ isOpen, onClose, onLogin }: AdminLoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your admin credentials and try again.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setError('Error fetching user profile. Please contact support.');
          await supabase.auth.signOut();
          return;
        }

        if (profile?.role !== 'admin') {
          setError('Access denied. This account does not have admin privileges.');
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome Admin!",
          description: "You have successfully logged in to the admin panel.",
        });

        onLogin(profile?.role || 'admin', { 
          ...data.user, 
          profile 
        });
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-gradient animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center gradient-text text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Admin Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border"
              placeholder="Enter admin email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input border-border"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="animate-fade-in bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Need admin access?</strong> Ensure you have:
              <ul className="mt-1 ml-4 list-disc text-sm">
                <li>A valid user account in Supabase Auth</li>
                <li>Profile role set to 'admin' in the profiles table</li>
                <li>Correct email and password credentials</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full btn-gradient hover:scale-105 transition-all duration-300"
            disabled={loading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? 'Signing in...' : 'Access Admin Panel'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Authorized personnel only
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;