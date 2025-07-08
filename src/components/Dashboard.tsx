
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderStudentDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="card-gradient border-0 animate-slide-in-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-500 mb-2">3</div>
          <p className="text-sm text-muted-foreground">Due this week</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-up delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500 mb-2">12</div>
          <p className="text-sm text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-right delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            Next Class
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-purple-500 mb-2">Mathematics</div>
          <p className="text-sm text-muted-foreground">Today at 2:00 PM</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-gradient border-0 animate-slide-in-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Active Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-500 mb-2">45</div>
          <p className="text-sm text-muted-foreground">Online now</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-up delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Tasks Created
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-500 mb-2">8</div>
          <p className="text-sm text-muted-foreground">This week</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-up delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-500 mb-2">15</div>
          <p className="text-sm text-muted-foreground">Submissions</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-right delay-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            Classes Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-500 mb-2">4</div>
          <p className="text-sm text-muted-foreground">Scheduled</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-gradient border-0 animate-slide-in-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-500 mb-2">1,234</div>
          <p className="text-sm text-muted-foreground">+12% this month</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-up delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-green-500" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500 mb-2">23</div>
          <p className="text-sm text-muted-foreground">Live now</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-up delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Total Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-500 mb-2">456</div>
          <p className="text-sm text-muted-foreground">This semester</p>
        </CardContent>
      </Card>

      <Card className="card-gradient border-0 animate-slide-in-right delay-400">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-500 mb-2">2</div>
          <p className="text-sm text-muted-foreground">Requires attention</p>
        </CardContent>
      </Card>
    </div>
  );

  const getDashboardContent = () => {
    switch (user.role) {
      case 'student':
        return renderStudentDashboard();
      case 'teacher':
        return renderTeacherDashboard();
      case 'admin':
        return renderAdminDashboard();
      default:
        return renderStudentDashboard();
    }
  };

  const getTabsForRole = () => {
    const commonTabs = ['overview', 'video', 'calendar'];
    
    switch (user.role) {
      case 'student':
        return [...commonTabs, 'tasks'];
      case 'teacher':
        return [...commonTabs, 'tasks', 'students'];
      case 'admin':
        return [...commonTabs, 'users', 'settings'];
      default:
        return commonTabs;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://harisandcoacademy.com/wp-content/uploads/2025/06/tech-school-logo-white.png" 
              alt="TechMeet Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
              <p className="text-sm text-muted-foreground capitalize">{user.role} Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-1/2 bg-secondary">
            {getTabsForRole().map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="capitalize data-[state=active]:bg-primary"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-muted-foreground">Your personalized learning hub</p>
            </div>
            {getDashboardContent()}
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            <div className="text-center py-20">
              <Video className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-2xl font-bold mb-2">Video Conferencing</h3>
              <p className="text-muted-foreground mb-6">Start or join video sessions</p>
              <Button className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Start New Session
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-2xl font-bold mb-2">Calendar</h3>
              <p className="text-muted-foreground">View your schedule and upcoming events</p>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h3 className="text-2xl font-bold mb-2">Tasks & Assignments</h3>
              <p className="text-muted-foreground">
                {user.role === 'teacher' ? 'Create and manage assignments' : 'View and submit your assignments'}
              </p>
              {user.role === 'teacher' && (
                <Button className="btn-gradient mt-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Task
                </Button>
              )}
            </div>
          </TabsContent>

          {user.role === 'teacher' && (
            <TabsContent value="students" className="mt-6">
              <div className="text-center py-20">
                <Users className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold mb-2">Students</h3>
                <p className="text-muted-foreground">Manage your students and track their progress</p>
              </div>
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <>
              <TabsContent value="users" className="mt-6">
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-2xl font-bold mb-2">User Management</h3>
                  <p className="text-muted-foreground">Manage all users and their permissions</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="text-center py-20">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-2xl font-bold mb-2">System Settings</h3>
                  <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
