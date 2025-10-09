import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/LibrarianDashboard.css';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-container">
        <NavLink className="header-logo-link" to="/">
          <img src="/images/acc_logo.png" alt="Logo" className="logo" />
          <span className="school-name">ASIAN COMPUTER COLLEGE</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink to="/librarian/dashboard" end>Dashboard</NavLink>
          <NavLink to="/librarian/manage-books">Manage Books</NavLink>
          <NavLink to="/librarian/manage-students">Manage Students</NavLink>
          <NavLink to="/librarian/view-bookings">View Appointments</NavLink>
          <NavLink to="/librarian/return-book">Return Book</NavLink>
          <NavLink to="/librarian/create-announcement">Create Announcement</NavLink>
          <NavLink onClick={handleLogout} to="/">Logout</NavLink>
        </nav>

        <div className="librarian-greeting">Hello, {user.name}</div>
      </div>
    </aside>
  );
}

export default Sidebar;
