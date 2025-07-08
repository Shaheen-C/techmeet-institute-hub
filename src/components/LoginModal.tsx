
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: string, userData: any) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    instituteId: '',
    password: '',
    role: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    instituteId: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.instituteId || !loginData.password || !loginData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate authentication
    const userData = {
      id: loginData.instituteId,
      role: loginData.role,
      name: loginData.role === 'admin' ? 'Admin User' : loginData.role === 'teacher' ? 'John Teacher' : 'Jane Student'
    };

    onLogin(loginData.role, userData);
    onClose();
    
    toast({
      title: "Login Successful",
      description: `Welcome ${userData.name}!`
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.instituteId || 
        !registerData.password || !registerData.confirmPassword || !registerData.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // Simulate registration
    const userData = {
      id: registerData.instituteId,
      role: registerData.role,
      name: registerData.name,
      email: registerData.email
    };

    onLogin(registerData.role, userData);
    onClose();
    
    toast({
      title: "Registration Successful",
      description: `Welcome ${userData.name}!`
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'teacher': return <User className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center gradient-text">
            Welcome to TechMeet
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-primary">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginRole">Role</Label>
                <Select value={loginData.role} onValueChange={(value) => setLoginData({...loginData, role: value})}>
                  <SelectTrigger className="bg-secondary border-white/10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-white/10">
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Teacher
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginId">Institute ID</Label>
                <Input
                  id="loginId"
                  placeholder="Enter your institute ID"
                  value={loginData.instituteId}
                  onChange={(e) => setLoginData({...loginData, instituteId: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="bg-secondary border-white/10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full btn-gradient">
                {getRoleIcon(loginData.role)}
                <span className="ml-2">Login</span>
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registerRole">Role</Label>
                <Select value={registerData.role} onValueChange={(value) => setRegisterData({...registerData, role: value})}>
                  <SelectTrigger className="bg-secondary border-white/10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-white/10">
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Student
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Teacher
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerName">Full Name</Label>
                <Input
                  id="registerName"
                  placeholder="Enter your full name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerId">Institute ID</Label>
                <Input
                  id="registerId"
                  placeholder="Enter your institute ID"
                  value={registerData.instituteId}
                  onChange={(e) => setRegisterData({...registerData, instituteId: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <Input
                  id="registerPassword"
                  type="password"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="bg-secondary border-white/10"
                />
              </div>

              <Button type="submit" className="w-full btn-gradient">
                {getRoleIcon(registerData.role)}
                <span className="ml-2">Register</span>
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
