'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { userService } from '@/services/NotionService';

const publicRoutes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const isPublicPage = publicRoutes.includes(pathname);

      if (!token) {
        if (!isPublicPage) {
          router.push('/login');
        } else {
          setLoading(false);
        }
        return;
      }

      try {
        await userService.getMe();
        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
  console.error("GETME FAILED:", error);

  localStorage.removeItem("token");
  setIsAuthorized(false);

  if (!isPublicPage) {
    router.push("/login");
  }

  setLoading(false);
}
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E19] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  if (!isAuthorized && !publicRoutes.includes(pathname)) {
    return null; 
  }

  return <>{children}</>;
}
