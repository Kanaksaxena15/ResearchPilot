import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, BookOpen } from 'lucide-react';

interface SidebarProps {
  isAuthenticated: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAuthenticated }) => {
  const location = useLocation();

  if (!isAuthenticated) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Paper', path: '/upload', icon: Upload },
    { name: 'My Papers', path: '/papers', icon: BookOpen },
  ];

  return (
    <aside id="sidebar-nav" className="w-16 sm:w-60 flex-shrink-0 border-r border-[#393939] bg-[#161616] flex flex-col justify-between py-4">
      <nav className="space-y-1 px-2 sm:px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/papers' && location.pathname.startsWith('/papers'));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center sm:justify-start gap-3 rounded-sm p-3 text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20'
                  : 'text-[#a8a8a8] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 hidden sm:block">
        <div className="rounded bg-[#262626] border border-[#393939] p-3 text-center">
          <span className="block text-[10px] uppercase tracking-widest text-[#8d8d8d]">IBM Granite</span>
          <span className="text-[11px] font-mono font-medium text-blue-400 block mt-0.5">Cognitive Active</span>
        </div>
      </div>
    </aside>
  );
};
