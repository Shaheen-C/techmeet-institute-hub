import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Shield } from 'lucide-react';
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
        setError(error.message);
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'admin') {
          setError('Access denied. Admin credentials required.');
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
      setError('An unexpected error occurred');
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