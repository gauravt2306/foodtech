import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isInitialized, isAuthenticated } = useAuthStore();
  console.log('[RootIndex] Render:', { isInitialized, isAuthenticated });

  // RootNavigator handles all redirects, this just prevents the default "/" route
  // from showing anything while RootNavigator decides where to go
  if (!isInitialized) {
    return null;
  }

  return null;
}