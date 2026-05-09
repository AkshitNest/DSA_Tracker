import { useState, useEffect } from 'react';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0';

export function useAppUser() {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0User();
  const [manualUser, setManualUser] = useState(null);
  const [manualLoading, setManualLoading] = useState(true);

  useEffect(() => {
    async function fetchManualUser() {
      try {
        const res = await fetch('/api/auth/manual/me');
        if (res.ok) {
          const data = await res.json();
          setManualUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching manual user:', err);
      } finally {
        setManualLoading(false);
      }
    }
    fetchManualUser();
  }, []);

  const user = auth0User || manualUser;
  const isLoading = auth0Loading || manualLoading;

  return { user, isLoading };
}
