import { useState, useEffect } from 'react';
import { getUser, isAuthenticated, getUserRole } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    role: getUserRole(),
  };
};
