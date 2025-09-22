import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // This effect runs when the app starts, checking for a saved user session
  useEffect(() => {
    const storedUser = sessionStorage.getItem('lms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    // Save user data to both state and sessionStorage for persistence
    sessionStorage.setItem('lms_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Clear user data from state and sessionStorage
    sessionStorage.removeItem('lms_user');
    setUser(null);
  };

  // Provide the user data, login/logout functions, and a helpful boolean
  const value = {
    user, // This object will contain the user's name
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is a custom hook that makes it easy to access the context
export const useAuth = () => {
  return useContext(AuthContext);
};