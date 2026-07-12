import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { motion } from 'motion/react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Upper Navigation Bar */}
      <Navbar 
        isAuthenticated={isAuthenticated} 
        userName={user?.name} 
        onLogout={handleLogout} 
      />

      {/* Main Core Section (Sidebar + Page Content) */}
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar isAuthenticated={isAuthenticated} />

        {/* Dynamic Route Screen Frame */}
        <main className="flex-1 overflow-y-auto bg-neutral-900 p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

