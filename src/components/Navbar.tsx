import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
  isAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName, 
  onLogout, 
  isAuthenticated 
}) => {
  return (
    <header id="navbar-header" className="flex h-14 items-center justify-between border-b border-[#393939] bg-[#161616] px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center bg-blue-600 rounded-sm">
          <Cpu size={18} className="text-white" />
        </div>
        <div>
          <span className="font-sans font-bold tracking-tight text-white text-base">ResearchPilot</span>
          <span className="ml-1.5 font-mono text-xs text-blue-400 font-medium tracking-wider">AI</span>
        </div>
      </Link>

      {isAuthenticated && userName && onLogout && (
        <UserMenu userName={userName} onLogout={onLogout} />
      )}
    </header>
  );
};
