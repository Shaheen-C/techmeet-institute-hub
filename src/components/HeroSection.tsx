
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Users, Calendar, BookOpen } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
      {/* Ambient Light Effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse-slow delay-700"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in-down">
            Be <span className="gradient-text">Technically</span> Awesome
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-in-up delay-200">
            Push past your boundaries by identifying and overcoming the limitations holding you back — it's time to debug your limits.
          </p>
          <div className="animate-slide-in-up delay-400">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="btn-gradient hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="card-gradient rounded-2xl p-6 text-center animate-slide-in-left delay-300 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-orange-500 mb-2">600+</h3>
            <p className="text-sm text-muted-foreground">Hours of Live Training</p>
          </div>

          <div className="card-gradient rounded-2xl p-6 text-center animate-slide-in-left delay-400 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float delay-100">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-500 mb-2">Join</h3>
            <p className="text-sm text-muted-foreground">Community of future tech leaders</p>
          </div>

          <div className="card-gradient rounded-2xl p-6 text-center animate-slide-in-right delay-400 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float delay-200">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-pink-500 mb-2">10+</h3>
            <p className="text-sm text-muted-foreground">Practical Projects</p>
          </div>

          <div className="card-gradient rounded-2xl p-6 text-center animate-slide-in-right delay-300 hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float delay-300">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-500 mb-2">100+</h3>
            <p className="text-sm text-muted-foreground">Students Enrolled</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
