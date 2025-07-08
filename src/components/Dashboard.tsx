
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  Calendar,
  FileText,
  Users,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  user: any;
  profile: any;
  onLogout: () => void;
}

const Dashboard = ({ user, profile, onLogout }: DashboardProps) => {
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      if (profile.role === 'teacher') {
        // Fetch teacher's classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', profile.id)
          .order('created_at', { ascending: false });

        // Fetch teacher's tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select(`
            *,
            classes(name)
          `)
          .eq('teacher_id', profile.id)
          .order('created_at', { ascending: false });

        // Fetch teacher's meetings
        const { data: meetingsData } = await supabase
          .from('meetings')
          .select(`
            *,
            classes(name)
          `)
          .eq('teacher_id', profile.id)
          .order('created_at', { ascending: false });

        setClasses(classesData || []);
        setTasks(tasksData || []);
        setMeetings(meetingsData || []);
      } else {
        // Fetch student's classes
        const { data: classesData } = await supabase
          .from('class_members')
          .select(`
            *,
            classes(*, profiles(name))
          `)
          .eq('student_id', profile.id);

        // Fetch student's tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select(`
            *,
            classes(name),
            profiles(name)
          `)
          .in('class_id', classesData?.map(c => c.class_id) || [])
          .order('created_at', { ascending: false });

        // Fetch student's meetings
        const { data: meetingsData } = await supabase
          .from('meetings')
          .select(`
            *,
            classes(name),
            profiles(name)
          `)
          .in('class_id', classesData?.map(c => c.class_id) || [])
          .order('created_at', { ascending: false });

        // Fetch student's submissions
        const { data: submissionsData } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks(title, classes(name))
          `)
          .eq('student_id', profile.id)
          .order('submitted_at', { ascending: false });

        setClasses(classesData?.map(c => c.classes) || []);
        setTasks(tasksData || []);
        setMeetings(meetingsData || []);
        setSubmissions(submissionsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      case 'completed': return 'bg-green-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
            <img 
              src="https://harisandcoacademy.com/wp-content/uploads/2025/06/tech-school-logo-white.png" 
              alt="TechMeet Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                {profile.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
              </h1>
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

      <div className="container mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-gradient animate-slide-in-up delay-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'teacher' ? 'Classes teaching' : 'Classes enrolled'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient animate-slide-in-up delay-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'teacher' ? 'Tasks created' : 'Tasks assigned'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient animate-slide-in-up delay-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meetings</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{meetings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'teacher' ? 'Meetings scheduled' : 'Meetings to attend'}
                  </p>
                </CardContent>
              </Card>

              {profile.role === 'student' && (
                <Card className="card-gradient animate-slide-in-up delay-400">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{submissions.length}</div>
                    <p className="text-xs text-muted-foreground">Tasks submitted</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-gradient animate-slide-in-left delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.classes?.name}
                            {profile.role === 'student' && task.profiles?.name && ` • ${task.profiles.name}`}
                          </p>
                          {task.due_date && (
                            <p className={`text-xs ${isOverdue(task.due_date) ? 'text-destructive' : 'text-muted-foreground'}`}>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {new Date(task.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient animate-slide-in-right delay-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {meetings.slice(0, 5).map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{meeting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.classes?.name}
                            {profile.role === 'student' && meeting.profiles?.name && ` • ${meeting.profiles.name}`}
                          </p>
                          {meeting.scheduled_at && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(meeting.scheduled_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                          {meeting.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    My Classes
                  </span>
                  {profile.role === 'teacher' && (
                    <Button className="btn-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Class
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="bg-secondary hover:bg-secondary/80 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        {cls.description && (
                          <p className="text-sm text-muted-foreground">{cls.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {new Date(cls.created_at).toLocaleDateString()}
                          </Badge>
                          <Button size="sm" className="btn-gradient">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {profile.role === 'teacher' ? 'My Tasks' : 'Assigned Tasks'}
                  </span>
                  {profile.role === 'teacher' && (
                    <Button className="btn-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="bg-secondary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{task.classes?.name}</Badge>
                              {task.due_date && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {profile.role === 'student' && (
                              <Button size="sm" className="btn-gradient">
                                Submit
                              </Button>
                            )}
                            {profile.role === 'teacher' && (
                              <Button size="sm" variant="outline">
                                View Submissions
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card className="card-gradient animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    {profile.role === 'teacher' ? 'My Meetings' : 'Scheduled Meetings'}
                  </span>
                  {profile.role === 'teacher' && (
                    <Button className="btn-gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Card key={meeting.id} className="bg-secondary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            {meeting.description && (
                              <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline">{meeting.classes?.name}</Badge>
                              {meeting.scheduled_at && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(meeting.scheduled_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                              {meeting.status}
                            </Badge>
                            {meeting.status === 'active' && (
                              <Button size="sm" className="btn-gradient">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
