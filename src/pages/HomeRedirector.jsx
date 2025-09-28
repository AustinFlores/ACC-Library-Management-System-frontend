import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from './Home';

function HomeRedirector() {
  const { isLoggedIn, user } = useAuth();
  // We need a state to track if AuthContext has *finished* its initial check.
  // isLoggedIn becoming true/false is a good indicator.
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // This effect runs once AuthContext has determined the isLoggedIn state.
    // If isLoggedIn is true or false, the check is complete.
    if (isLoggedIn !== null) { // isLoggedIn will be boolean (true/false) after check
      setAuthCheckComplete(true);
    }
  }, [isLoggedIn]); // Depend on isLoggedIn changing from its initial null/undefined state

  if (!authCheckComplete) {
    // Still waiting for AuthContext to check sessionStorage.
    // Render a loading state or nothing to prevent premature redirects.
    return <div>Loading authentication...</div>; 
  }

  // --- Auth check is complete, now proceed ---
  if (isLoggedIn) {
    // User is logged in, redirect based on role
    // Ensure 'user' object is valid before accessing 'user.role'
    if (user && (user.role === 'librarian' || user.role === 'admin')) {
      return <Navigate to="/librarian/dashboard" replace />;
    } else if (user && user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // Fallback for logged-in user with an unknown/missing role (should ideally not happen)
    console.warn("Logged in user with unknown role:", user);
    return <Navigate to="/browse-books" replace />; 
  }

  // If not logged in, render the HeroSection
  return <Home />;
}

export default HomeRedirector;