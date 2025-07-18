
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Video, 
  Settings,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Building2,
  Check,
  X,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

const AdminDashboard = ({ user, profile, onLogout }: AdminDashboardProps) => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [instituteIds, setInstituteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [newInstituteId, setNewInstituteId] = useState('');
  const [newInstituteName, setNewInstituteName] = useState('');
  const [editingInstitute, setEditingInstitute] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } else {
        setUsers(usersData || []);
      }

      // Fetch pending users
      const { data: pendingUsersData } = await supabase
        .from('pending_users')
        .select('*')
        .order('created_at', { ascending: false });

      setPendingUsers(pendingUsersData || []);

      // Fetch all classes
      const { data: classesData } = await supabase
        .from('classes')
        .select(`
          *,
          profiles!classes_teacher_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      // Fetch all tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!tasks_teacher_id_fkey(name),
          classes(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch all meetings
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select(`
          *,
          profiles!meetings_teacher_id_fkey(name),
          classes(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch institute IDs
      const { data: instituteIdsData } = await supabase
        .from('institute_ids')
        .select('*')
        .order('created_at', { ascending: false });

      setClasses(classesData || []);
      setTasks(tasksData || []);
      setMeetings(meetingsData || []);
      setInstituteIds(instituteIdsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstituteId = async () => {
    if (!newInstituteId || !newInstituteName) {
      toast({
        title: "Error",
        description: "Please provide both institute ID and name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('institute_ids')
        .insert([
          {
            institute_id: newInstituteId,
            institute_name: newInstituteName,
            is_active: true
          }
        ])
        .select();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add institute ID. It may already exist.",
          variant: "destructive",
        });
        return;
      }

      setInstituteIds([...instituteIds, data[0]]);
      setNewInstituteId('');
      setNewInstituteName('');
      
      toast({
        title: "Success",
        description: "Institute ID added successfully.",
      });
    } catch (error) {
      console.error('Error adding institute ID:', error);
    }
  };

  const toggleInstituteStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('institute_ids')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update institute status.",
          variant: "destructive",
        });
        return;
      }

      setInstituteIds(instituteIds.map(inst => 
        inst.id === id ? { ...inst, is_active: !currentStatus } : inst
      ));

      toast({
        title: "Success",
        description: `Institute ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating institute status:', error);
    }
  };

  const handleApproveUser = async (pendingUser: any) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action.",
          variant: "destructive",
        });
        return;
      }

      // Call the Edge Function to create the user
      const response = await fetch(`https://phtlgzuavzqzfrseqgou.supabase.co/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pendingUser.name,
          email: pendingUser.email,
          institute_id: pendingUser.institute_id,
          role: pendingUser.role
        })
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to create user account.",
          variant: "destructive",
        });
        return;
      }

      // Remove from pending users
      const { error: deleteError } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', pendingUser.id);

      if (deleteError) {
        console.error('Error removing pending user:', deleteError);
      }

      // Refresh data
      fetchAllData();

      toast({
        title: "User Approved",
        description: `${pendingUser.name} has been approved and can now log in.`,
      });
      
      // Show additional info about password setup
      setTimeout(() => {
        toast({
          title: "Password Setup Email Sent",
          description: `${pendingUser.name} will receive an email to set up their password.`,
        });
      }, 2000);
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
    }
  };

  const handleRejectUser = async (pendingUser: any) => {
    try {
      const { error } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', pendingUser.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to reject user.",
          variant: "destructive",
        });
        return;
      }

      setPendingUsers(pendingUsers.filter(user => user.id !== pendingUser.id));

      toast({
        title: "User Rejected",
        description: `${pendingUser.name}'s registration has been rejected.`,
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'teacher': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 animate-slide-in-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {profile.name}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="card-gradient animate-slide-in-up delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.role === 'student').length} students, {users.filter(u => u.role === 'teacher').length} teachers
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-slide-in-up delay-150">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingUsers.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-slide-in-up delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-slide-in-up delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">Assignments</p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-slide-in-up delay-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meetings.length}</div>
              <p className="text-xs text-muted-foreground">Video sessions</p>
            </CardContent>
          </Card>

          <Card className="card-gradient animate-slide-in-up delay-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institute IDs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instituteIds.length}</div>
              <p className="text-xs text-muted-foreground">
                {instituteIds.filter(i => i.is_active).length} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingUsers.length > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-black text-xs">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="institutes">Institutes</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pending User Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-black">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.institute_id} • {user.role} • {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectUser(user)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.institute_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getRoleColor(user.role)} text-white`}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutes" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Institute ID Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="institute-id">Institute ID</Label>
                      <Input
                        id="institute-id"
                        placeholder="e.g., TECH001"
                        value={newInstituteId}
                        onChange={(e) => setNewInstituteId(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="institute-name">Institute Name</Label>
                      <Input
                        id="institute-name"
                        placeholder="e.g., Tech Institute Main Campus"
                        value={newInstituteName}
                        onChange={(e) => setNewInstituteName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddInstituteId} className="btn-gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        Add ID
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {instituteIds.map((institute) => (
                      <div 
                        key={institute.id} 
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{institute.institute_id}</p>
                            <p className="text-sm text-muted-foreground">{institute.institute_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${institute.is_active ? 'bg-green-500' : 'bg-red-500'} text-white`}
                          >
                            {institute.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleInstituteStatus(institute.id, institute.is_active)}
                          >
                            {institute.is_active ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Database Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Users:</span>
                        <span className="font-medium">{users.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Approvals:</span>
                        <span className="font-medium text-yellow-500">{pendingUsers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Classes:</span>
                        <span className="font-medium">{classes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-medium">{tasks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Meetings:</span>
                        <span className="font-medium">{meetings.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">System Health</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Database: Online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Authentication: Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>File Storage: Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
