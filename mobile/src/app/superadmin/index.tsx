import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    console.log('[SuperAdminIndex] Redirecting to /superadmin/dashboard');
    router.replace('/superadmin/dashboard');
  }, [router]);
  return null;
}
