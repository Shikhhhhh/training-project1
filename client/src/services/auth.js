export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  // Ensure profilePicture is preserved if it exists
  const existingUser = getUser();
  if (existingUser?.profilePicture && !user?.profilePicture) {
    user = { ...user, profilePicture: existingUser.profilePicture };
  }
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper function to update user data
export const updateUser = (updates) => {
  const user = getUser();
  if (user) {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => !!getToken();

export const getUserRole = () => getUser()?.role || null;

