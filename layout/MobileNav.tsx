
import React from 'react';
import { LayoutDashboard, Code2, FolderKanban, ShoppingCart, User as UserIcon, ShieldAlert } from 'lucide-react';
import { AppMode, User } from '../types';

interface MobileNavProps {
  path: string;
  mode: AppMode;
  user?: User;
  navigateTo: (path: string, mode: AppMode) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ path, mode, user, navigateTo }) => {
  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl flex items-center justify-around p-3 z-50 shadow-2xl pb-3">
      <button 
        onClick={() => navigateTo('/dashboard', AppMode.PREVIEW)} 
        className={`p-3.5 transition-all rounded-2xl ${path === '/dashboard' && mode !== AppMode.EDIT ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-zinc-500'}`}
      >
        <LayoutDashboard size={22}/>
      </button>
      <button 
        onClick={() => navigateTo('/dashboard', AppMode.EDIT)} 
        className={`p-3.5 transition-all rounded-2xl ${path === '/dashboard' && mode === AppMode.EDIT ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-zinc-500'}`}
      >
        <Code2 size={22}/>
      </button>
      <button 
        onClick={() => navigateTo('/projects', AppMode.PROJECTS)} 
        className={`p-3.5 transition-all rounded-2xl ${path === '/projects' ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-zinc-500'}`}
      >
        <FolderKanban size={22}/>
      </button>
      
      {user?.isAdmin && (
        <button 
          onClick={() => navigateTo('/admin', AppMode.ADMIN)} 
          className={`p-3.5 transition-all rounded-2xl ${path === '/admin' ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-pink-500/40'}`}
        >
          <ShieldAlert size={22}/>
        </button>
      )}

      <button 
        onClick={() => navigateTo('/shop', AppMode.SHOP)} 
        className={`p-3.5 transition-all rounded-2xl ${path === '/shop' ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-zinc-500'}`}
      >
        <ShoppingCart size={22}/>
      </button>
      <button 
        onClick={() => navigateTo('/profile', AppMode.PROFILE)} 
        className={`p-3.5 transition-all rounded-2xl ${path === '/profile' ? 'text-white bg-pink-600 shadow-[0_0_20px_#ec4899] scale-110' : 'text-zinc-500'}`}
      >
        <UserIcon size={22}/>
      </button>
    </div>
  );
};

export default MobileNav;
