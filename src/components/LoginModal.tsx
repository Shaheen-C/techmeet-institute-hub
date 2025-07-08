
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, LogIn, UserPlus, Shield, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  institute_id: string;
  role: string;
  created_at: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: string, userData: any) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableInstituteIds, setAvailableInstituteIds] = useState([]);
  const { toast } = useToast();

  // Add state for pending approval message
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<PendingUser | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'signup') {
      fetchAvailableInstituteIds();
    }
  }, [isOpen, activeTab]);

  const fetchAvailableInstituteIds = async () => {
    try {
      const { data, error } = await supabase
        .from('institute_ids')
        .select('institute_id, institute_name')
        .eq('is_active', true)
        .order('institute_name');

      if (error) {
        console.error('Error fetching institute IDs:', error);
      } else {
        setAvailableInstituteIds(data || []);
      }
    } catch (err) {
      console.error('Error fetching institute IDs:', err);
    }
  };

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

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        onLogin(profile?.role || 'student', { 
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!instituteId) {
      setError('Please select an institute ID');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            institute_id: instituteId,
            role,
            status: 'pending_approval'
          },
        }
      });

      if (error) {
        if (error.message.includes('Invalid institute ID')) {
          setError('The selected institute ID is not valid or has been deactivated.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Store pending user data for display
        setPendingUserData({
          id: data.user.id,
          name,
          email,
          institute_id: instituteId,
          role,
          created_at: new Date().toISOString()
        });
        
        setShowPendingMessage(true);
        
        toast({
          title: "Registration Submitted!",
          description: "Your account is pending admin approval. You will be notified once approved.",
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setInstituteId('');
    setRole('student');
    setError('');
  };

  const handleBackToLogin = () => {
    setShowPendingMessage(false);
    setPendingUserData(null);
    setActiveTab('login');
    resetForm();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowPendingMessage(false);
    setPendingUserData(null);
    resetForm();
  };

  // Show pending approval message
  if (showPendingMessage && pendingUserData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md card-gradient animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text text-2xl font-bold">
              Registration Pending
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Account Under Review</h3>
              <p className="text-muted-foreground">
                Your registration has been submitted and is awaiting admin approval.
              </p>
            </div>

            <div className="bg-secondary p-4 rounded-lg text-left space-y-2">
              <p><strong>Name:</strong> {pendingUserData.name}</p>
              <p><strong>Email:</strong> {pendingUserData.email}</p>
              <p><strong>Institute ID:</strong> {pendingUserData.institute_id}</p>
              <p><strong>Role:</strong> {pendingUserData.role}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You will receive an email notification once your account is approved by the administrator.
              </p>
              <p className="text-sm text-muted-foreground">
                This process typically takes 1-2 business days.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 btn-gradient"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-gradient animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center gradient-text text-2xl font-bold">
            Access TechMeet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 animate-fade-in">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Admin access: shaheenshanu246@gmail.com
              </p>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 animate-fade-in">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institute-id" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Institute ID *
                </Label>
                <Select value={instituteId} onValueChange={setInstituteId} required>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select your institute" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstituteIds.map((institute) => (
                      <SelectItem key={institute.institute_id} value={institute.institute_id}>
                        {institute.institute_id} - {institute.institute_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Your account will require admin approval after registration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
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
                {loading ? 'Submitting for approval...' : 'Submit for Approval'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>New registrations require admin approval • By continuing, you agree to our Terms of Service</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
