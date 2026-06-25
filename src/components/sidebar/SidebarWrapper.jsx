'use client';

import { usePathname } from 'next/navigation';
import { SideBar } from './SideBar';

export default function SidebarWrapper() {
  const pathname = usePathname();
  
  // Add any other routes where you want to hide the sidebar here
  const hideSidebarRoutes = ['/login', '/register'];
  
  if (hideSidebarRoutes.includes(pathname)) {
    return null;
  }

  return <SideBar />;
}