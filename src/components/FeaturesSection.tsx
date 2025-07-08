
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, FileText, Users, Shield, Calendar, MessageSquare } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Video,
      title: "HD Video Conferencing",
      description: "Crystal clear video calls with screen sharing, whiteboard, and recording capabilities.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: FileText,
      title: "Task Management",
      description: "Assign, submit, and track assignments with file uploads and deadline reminders.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for teachers, students, and administrators with custom permissions.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Institute-specific IDs with encrypted credentials and session protection.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated attendance tracking with calendar integration and reminders.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "In-call messaging, raise hand feature, and live polls during sessions.",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-in-down">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-up delay-200">
            Everything you need for modern educational collaboration and management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`card-gradient hover:scale-105 transition-all duration-300 animate-slide-in-up delay-${(index + 1) * 100} border-0`}
            >
              <CardHeader>
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
