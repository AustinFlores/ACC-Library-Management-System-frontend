import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Assuming you've added this for ProtectedRoute/HomeRedirector

  useEffect(() => {
    const storedUser = sessionStorage.getItem('lms_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); 
      console.log('AuthContext: Loaded user from sessionStorage:', parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('AuthContext: User data passed to login:', userData);
    sessionStorage.setItem('lms_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.log('AuthContext: User logged out');
    sessionStorage.removeItem('lms_user');
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};