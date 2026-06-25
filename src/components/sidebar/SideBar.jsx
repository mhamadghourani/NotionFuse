'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { LayoutDashboard, Database, Shuffle, RefreshCw, Settings, Moon, Sun, Menu, X, User } from 'lucide-react';

export const SideBar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#15192D] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} className="dark:text-gray-100" /> : <Menu size={20} className="dark:text-gray-100" />}
      </button>

      {/* Sidebar Drawer */}
      <aside className={`fixed md:relative z-40 w-60 h-screen border-r border-gray-200/60 dark:border-gray-800/80 bg-white/90 dark:bg-[#15192D]/95 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Header with Beta Badge */}
        <section className="flex items-center gap-2.5 px-6 py-6 mt-14 md:mt-0">
          <div className="relative size-8 overflow-hidden rounded-lg shadow-sm">
            <Image src="/nf.png" alt="Logo" fill className="object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight text-sm uppercase">Notion Fuse</h1>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest">
              Beta
            </span>
          </div>
        </section>

        {/* Navigation */}
        <nav className="px-3 flex-1" onClick={() => setIsOpen(false)}>
          <ul className="space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard size={17} />} label="Dashboard" isActive={pathname === '/dashboard'} />
            <SidebarLink href="/connections" icon={<Database size={17} />} label="Connections" isActive={pathname === '/connections'} />
            <SidebarLink href="/merges" icon={<Shuffle size={17} />} label="Merges" isActive={pathname === '/merges'} />
            <SidebarLink href="/sync" icon={<RefreshCw size={17} />} label="Sync" isActive={pathname === '/sync'} />
            <SidebarLink href="/settings" icon={<Settings size={17} />} label="Settings" isActive={pathname === '/settings'} />
          </ul>
        </nav>

        {/* Footer Actions */}
        <section className="p-4 border-t border-gray-100 dark:border-gray-800/50">
          <Link href="/settings" className="flex items-center gap-3 w-full px-3 py-2 mb-2 text-[11px] font-bold uppercase tracking-wider rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1D243C] hover:text-gray-900 dark:hover:text-gray-200 transition-all">
            <User size={14} />
            <span>My Profile</span>
          </Link>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1D243C] hover:text-gray-900 dark:hover:text-gray-200 transition-all active:scale-[0.98]"
          >
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-500" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </section>
      </aside>
    </>
  );
};

function SidebarLink({ icon, label, href, isActive }) {
  return (
    <li>
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98] ${
          isActive 
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-[#1D243C]/50 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
          {icon}
        </span>
        {label}
      </Link>
    </li>
  );
}