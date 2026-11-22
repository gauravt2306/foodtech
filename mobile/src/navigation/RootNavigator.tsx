import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const RootNavigator = () => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  console.log('[RootNavigator] Render:', { isInitialized, isAuthenticated, user: user?.role, routerPath: pathname });

  // Handle redirect in useEffect - more reliable than redirect() during render
  useEffect(() => {
    if (isInitialized) {
      console.log('[RootNavigator] isInitialized is true, checking auth');
      if (isAuthenticated && user) {
        const role = user.role?.toLowerCase();
        console.log('[RootNavigator] Redirecting to role:', role);

        let targetPath = '/employee/home';
        if (role === 'superadmin') {
          targetPath = '/superadmin/dashboard';
        } else if (role === 'vendor') {
          targetPath = '/vendor/dashboard';
        }

        console.log('[RootNavigator] Target path:', targetPath);
        router.replace(targetPath);
        console.log('[RootNavigator] router.replace call completed');
      } else if (!isAuthenticated) {
        console.log('[RootNavigator] Redirecting to login');
        router.replace('/Login');
        console.log('[RootNavigator] login redirect call completed');
      }
    } else {
      console.log('[RootNavigator] Not initialized yet, skipping redirect');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Add another effect to track route changes
  useEffect(() => {
    console.log('[RootNavigator] Effect re-run:', { isInitialized, isAuthenticated, user: user?.role, routerPath: pathname });
  }, [isInitialized, isAuthenticated, user, pathname]);

  // After initialization, return null so Slot can render the matched route
  return null;
};
