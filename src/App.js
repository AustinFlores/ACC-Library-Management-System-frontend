import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// NEW: HomeRedirector and HeroSection for the root path logic
import HomeRedirector from './pages/HomeRedirector.jsx'; 
// Note: HeroSection is imported by HomeRedirector, no direct import needed here anymore
// So, you can remove 'import Home from './pages/Home.jsx'' if Home was just HeroSection

// Public Page Components
import Signin from './pages/Signin.jsx';
import Signup from './pages/Signup.jsx';
import VisitLibrary from './pages/VisitLibrary.jsx';
import RequestQR from './pages/RequestQR.jsx';
import BrowseBooks from './pages/BrowseBooks.jsx';
import BorrowRequest from './pages/BorrowRequest.jsx';
import Contact from './pages/Contact.jsx';
import Faqs from './pages/Faqs.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import BorrowedBooks from './pages/BorrowedBooks.jsx';
import ManageStudentBookings from './pages/ManageStudentBookings.jsx';
import OverdueBooks from './pages/OverdueBooks.jsx';

// Librarian Dashboard Components
import LibrarianDashboard from './pages/LibrarianDashboard.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import ManageStudents from './pages/ManageStudents.jsx'; 
import ViewBookings from './pages/ViewBookings.jsx';
import ScanReturnBook from './pages/ScanReturnBook.jsx';
import CreateAnnouncement from './pages/CreateAnnouncement.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import './styles/App.css';

function App() {
  return (
    <div className='App'>
      <Router>
        <Routes>
          {/* === Root Route: Handles redirection based on login status/role === */}
          <Route path="/" element={<HomeRedirector />} />
          {/* HomeRedirector will render HeroSection if not logged in, 
              or redirect to appropriate dashboard if logged in. */}

          {/* === Public Routes === */}
          {/* If Home.jsx was just your HeroSection, you can remove this duplicate route. */}
          {/* Otherwise, if Home.jsx is a different page, keep it as needed. */}
          {/* <Route path="/home-page-if-different" element={<Home />} /> */}

          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/visit-library" element={<VisitLibrary />} />
          <Route path="/requestqr" element={<RequestQR />} />
          <Route path="/browse-books" element={<BrowseBooks />} />
          <Route path="/borrow-request" element={<BorrowRequest />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} /> 
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> 

          {/* === Protected Librarian Dashboard Routes === */}
          {/* This parent route uses ProtectedRoute to guard access and LibrarianDashboard as the layout */}
          <Route 
            path="/librarian" // Base path for librarian section (as per your request)
            element={
              <ProtectedRoute>
                <LibrarianDashboard />
              </ProtectedRoute>
            }
          >
            {/* The index route (default child route for /librarian) */}
            <Route index element={<DashboardHome />} /> 
            {/* Specific routes within the librarian dashboard */}
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="manage-books" element={<BrowseBooks />} />
            <Route path="manage-students" element={<ManageStudents />} />
            <Route path="view-bookings" element={<ViewBookings />} />
            <Route path="return-book" element={<ScanReturnBook />} />
            <Route path="create-announcement" element={<CreateAnnouncement />} />
          </Route>

          {/* Optional: Add a catch-all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

            <Route path="/student/borrowed-books" element={<BorrowedBooks />} />
            <Route path="/student/overdue-books" element={<OverdueBooks />} />
            <Route path="/student/manage-bookings" element={<ManageStudentBookings />} />


        </Routes>
      </Router>
    </div>
  )
}

export default App;