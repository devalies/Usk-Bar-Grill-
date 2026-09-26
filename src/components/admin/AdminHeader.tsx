import React from 'react';
import { ExternalLink, LogOut, ShieldCheck, UserCheck, Menu as MenuIcon } from 'lucide-react';
import { AdminUser } from '../../types/cms';

interface AdminHeaderProps {
  user: AdminUser;
  onLogout: () => void;
  onViewLiveSite: () => void;
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onLogout,
  onViewLiveSite,
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950 border-b border-stone-800 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition"
          aria-label="Toggle menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Usk Bar and Grill Logo"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/50 shadow-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white font-display">Usk CMS</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Control Panel
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onViewLiveSite}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          <span>View Live Site</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-800">
          <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 text-xs font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-white leading-tight">{user.name}</p>
            <p className="text-[10px] text-stone-400 capitalize flex items-center gap-1">
              {user.role === 'admin' ? (
                <ShieldCheck className="w-3 h-3 text-amber-400 inline" />
              ) : (
                <UserCheck className="w-3 h-3 text-stone-400 inline" />
              )}
              <span>{user.role}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 text-stone-400 hover:text-red-400 rounded-lg hover:bg-stone-900 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
