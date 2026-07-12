import React from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  return (
    <div id="user-menu-component" className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
          <UserIcon size={12} className="text-neutral-300" />
        </div>
        <span className="hidden sm:inline-block font-medium">{userName}</span>
      </div>
      
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 border border-[#393939] px-3 py-1.5 text-xs text-[#e0e0e0] hover:bg-red-950/20 hover:border-red-800 hover:text-red-400 transition-all cursor-pointer rounded-sm"
        title="Logout session"
      >
        <LogOut size={12} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};
