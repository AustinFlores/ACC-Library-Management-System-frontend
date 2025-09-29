import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // If not logged in, redirect to the signin page
    return <Navigate to="/signin" />;
  }
  
  if (user.role === 'student') {
    // If logged in but not a librarian, redirect to the student dashboard
    return <Navigate to="/student/dashboard" />;
  }

  else if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  // If logged in and is a librarian, render the requested component
  return children;
}

export default ProtectedRoute;