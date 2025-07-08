
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar = ({ onLoginClick }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="animate-slide-in-left">
            <img 
              src="https://harisandcoacademy.com/wp-content/uploads/2025/06/tech-school-logo-white.png" 
              alt="TechMeet Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-8 animate-slide-in-down delay-200">
            <a href="#home" className="text-foreground hover:text-purple-400 transition-colors duration-300">
              Home
            </a>
            <a href="#features" className="text-foreground hover:text-purple-400 transition-colors duration-300">
              Features
            </a>
            <a href="#about" className="text-foreground hover:text-purple-400 transition-colors duration-300">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-purple-400 transition-colors duration-300">
              Contact
            </a>
          </div>
          
          <div className="animate-slide-in-right delay-300">
            <Button 
              onClick={onLoginClick}
              className="btn-gradient hover:scale-105 transition-all duration-300"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
