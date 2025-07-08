
-- Create enum types for roles and task status
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE public.task_status AS ENUM ('pending', 'submitted', 'completed');
CREATE TYPE public.meeting_status AS ENUM ('scheduled', 'active', 'ended');

-- Create profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  institute_id TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table for organizing users into classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_members table for student-class relationships
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Create tasks table for assignments
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  allow_file_upload BOOLEAN DEFAULT TRUE,
  allow_text_response BOOLEAN DEFAULT TRUE,
  max_file_size INTEGER DEFAULT 10485760, -- 10MB in bytes
  allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'zip'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_submissions table for student submissions
CREATE TABLE public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text_response TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  status task_status DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  UNIQUE(task_id, student_id)
);

-- Create meetings table for video conferences
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  meeting_url TEXT,
  meeting_id TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  status meeting_status DEFAULT 'scheduled',
  max_participants INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting_participants table for tracking attendance
CREATE TABLE public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  UNIQUE(meeting_id, user_id)
);

-- Create notifications table for reminders and alerts
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'task_reminder', 'meeting_reminder', 'task_assigned', etc.
  read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- can reference task_id, meeting_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for classes table
CREATE POLICY "Teachers can view their own classes" ON public.classes
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members 
      WHERE class_id = id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create classes" ON public.classes
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own classes" ON public.classes
  FOR UPDATE USING (teacher_id = auth.uid());

-- Create RLS policies for tasks table
CREATE POLICY "Teachers can view their own tasks" ON public.tasks
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students can view tasks from their classes" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members 
      WHERE class_id = tasks.class_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own tasks" ON public.tasks
  FOR UPDATE USING (teacher_id = auth.uid());

-- Create RLS policies for task_submissions table
CREATE POLICY "Students can view their own submissions" ON public.task_submissions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their tasks" ON public.task_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_submissions.task_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can create submissions" ON public.task_submissions
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Students can update their own submissions" ON public.task_submissions
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Teachers can update submissions for their tasks" ON public.task_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_submissions.task_id AND teacher_id = auth.uid()
    )
  );

-- Create RLS policies for meetings table
CREATE POLICY "Teachers can view their own meetings" ON public.meetings
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students can view meetings from their classes" ON public.meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members 
      WHERE class_id = meetings.class_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

CREATE POLICY "Teachers can update their own meetings" ON public.meetings
  FOR UPDATE USING (teacher_id = auth.uid());

-- Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, institute_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'institute_id', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', true);

-- Create storage policies
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view files they uploaded" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can view all files in their tasks" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'task-files' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );
