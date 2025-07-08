
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import LoginModal from '@/components/LoginModal';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userType: string, userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />
      <HeroSection onGetStarted={() => setShowLoginModal(true)} />
      <FeaturesSection />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
